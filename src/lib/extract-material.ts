export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_MATERIAL_CHARS = 30000;
export const ACCEPTED_EXTENSIONS = ["pdf", "pptx", "txt", "md", "markdown"] as const;

export interface ExtractedMaterial {
  text: string;
  pages?: number;
  warning?: string;
}

export function fileExtension(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function isSupportedMaterialFile(file: File) {
  return (ACCEPTED_EXTENSIONS as readonly string[]).includes(fileExtension(file.name));
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function cleanLine(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function friendlyError(error: unknown, filename: string) {
  const message = error instanceof Error ? error.message : "";
  if (/password|encrypt/i.test(message)) {
    return `${filename} is password-protected. Unlock the file, then upload it again.`;
  }
  if (/scan|image-only|no readable text/i.test(message)) {
    return `${filename} appears to be a scanned document. Paste the text instead so we can read it accurately.`;
  }
  if (/zip|corrupt|invalid/i.test(message)) {
    return `${filename} could not be opened. It may be damaged or saved in an unsupported format.`;
  }
  return `${filename} could not be read. Try exporting it again as a PDF or paste the text instead.`;
}

async function extractPdf(file: File): Promise<ExtractedMaterial> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buffer = new Uint8Array(await file.arrayBuffer());
  const document = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  let emptyPages = 0;

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const rows: string[] = [];
    let current = "";

    for (const item of content.items) {
      if (!("str" in item)) continue;
      current += `${item.str}${item.hasEOL ? "\n" : " "}`;
      if (item.hasEOL) {
        const line = cleanLine(current);
        if (line) rows.push(line);
        current = "";
      }
    }
    const tail = cleanLine(current);
    if (tail) rows.push(tail);

    const body = rows.join("\n");
    if (body.trim().length < 12) {
      emptyPages += 1;
      pages.push(`[Page ${pageNumber}]\n(no readable text on this page)`);
    } else {
      pages.push(`[Page ${pageNumber}]\n${body}`);
    }
  }

  const readable = pages.filter((page) => !page.includes("(no readable text")).join("\n\n");
  if (readable.trim().length < 40) {
    throw new Error("This PDF appears to be a scan with no readable text.");
  }

  return {
    text: pages.join("\n\n"),
    pages: document.numPages,
    warning:
      emptyPages > 0
        ? `${emptyPages} page${emptyPages === 1 ? "" : "s"} contained no readable text. Check the extracted material before generating.`
        : undefined,
  };
}

function readXmlParagraphs(xml: string, tag = "a:p") {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const paragraphs = Array.from(doc.getElementsByTagName(tag));
  return paragraphs
    .map((paragraph) =>
      Array.from(paragraph.getElementsByTagName("a:t"))
        .map((node) => node.textContent ?? "")
        .join("")
        .trim(),
    )
    .filter(Boolean);
}

async function extractPptx(file: File): Promise<ExtractedMaterial> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  const slideNames = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path))
    .sort((a, b) => {
      const aNumber = Number(a.match(/slide(\d+)\.xml/)?.[1] ?? 0);
      const bNumber = Number(b.match(/slide(\d+)\.xml/)?.[1] ?? 0);
      return aNumber - bNumber;
    });

  if (!slideNames.length) {
    throw new Error("This file does not contain any readable slides.");
  }

  const sections: string[] = [];
  for (const slidePath of slideNames) {
    const number = slidePath.match(/slide(\d+)\.xml/)?.[1] ?? "1";
    const slideXml = await zip.file(slidePath)?.async("string");
    if (!slideXml) continue;
    const paragraphs = readXmlParagraphs(slideXml);

    const notesPath = `ppt/notesSlides/notesSlide${number}.xml`;
    const notesXml = zip.file(notesPath) ? await zip.file(notesPath)?.async("string") : null;
    const notes = notesXml ? readXmlParagraphs(notesXml) : [];

    if (!paragraphs.length && !notes.length) {
      sections.push(`[Slide ${number}]\n(no readable text on this slide)`);
      continue;
    }

    sections.push(
      `[Slide ${number}]\n${paragraphs.join("\n")}${
        notes.length ? `\n\nSpeaker notes:\n${notes.join("\n")}` : ""
      }`,
    );
  }

  const readable = sections.filter((section) => !section.includes("(no readable text")).join("\n\n");
  if (readable.trim().length < 30) {
    throw new Error("The slides contain images only, with no readable text.");
  }

  return { text: sections.join("\n\n"), pages: slideNames.length };
}

async function extractText(file: File): Promise<ExtractedMaterial> {
  const text = await file.text();
  if (!text.trim()) {
    throw new Error("This file is empty.");
  }
  return { text: text.replace(/\r/g, "").trim() };
}

export async function extractMaterialFile(file: File): Promise<ExtractedMaterial> {
  if (!isSupportedMaterialFile(file)) {
    throw new Error(
      `${file.name} has an unsupported format. Upload a PDF, PowerPoint, Markdown or plain text file.`,
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${file.name} is larger than 25 MB. Split it up or paste the relevant section instead.`);
  }

  try {
    const extension = fileExtension(file.name);
    if (extension === "pdf") return await extractPdf(file);
    if (extension === "pptx") return await extractPptx(file);
    return await extractText(file);
  } catch (error) {
    throw new Error(friendlyError(error, file.name));
  }
}

export function deriveTitleFromMaterial(material: string, filenames: string[]) {
  if (filenames.length) {
    const first = filenames[0].replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
    if (first) return first.slice(0, 80);
  }
  const firstLine = material
    .split("\n")
    .map((line) => line.replace(/^[#*\-\d.\s]+/, "").trim())
    .find((line) => line.length > 3 && !line.startsWith("[Page") && !line.startsWith("[Slide"));
  return (firstLine || "My study material").slice(0, 80);
}
