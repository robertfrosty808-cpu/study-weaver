"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { vly } from "../lib/vly-integrations";
import { DETAIL_LEVELS, type DetailLevel, type NoteBlock, type NoteSettings } from "../lib/note-types";

interface OutlineChapter {
  title: string;
  summary: string;
  topics: string[];
  keyTerms: string[];
}

interface Outline {
  title: string;
  subtitle: string;
  subject: string;
  chapters: OutlineChapter[];
  warnings?: string[];
}

const ALLOWED_TYPES = new Set([
  "chapterHeader",
  "paragraph",
  "bulletList",
  "definition",
  "formula",
  "example",
  "callout",
  "prosCons",
  "comparisonTable",
  "flowchart",
  "steps",
  "tree",
  "code",
  "solvedProblem",
  "flashcards",
  "glossary",
  "takeaways",
  "quiz",
]);

const TYPE_ALIASES: Record<string, string> = {
  heading: "chapterHeader",
  chapter: "chapterHeader",
  sectionheader: "chapterHeader",
  hero: "paragraph",
  paragraph: "paragraph",
  richparagraph: "paragraph",
  bullets: "bulletList",
  bulletlist: "bulletList",
  list: "bulletList",
  definitioncard: "definition",
  keyterm: "definition",
  formulacard: "formula",
  equation: "formula",
  examplecard: "example",
  workedexample: "example",
  callout: "callout",
  importantnote: "callout",
  warningbox: "callout",
  examtip: "callout",
  proscons: "prosCons",
  advantagesdisadvantages: "prosCons",
  comparisontable: "comparisonTable",
  table: "comparisonTable",
  flowchart: "flowchart",
  processdiagram: "flowchart",
  diagram: "flowchart",
  steps: "steps",
  timeline: "steps",
  steptimeline: "steps",
  tree: "tree",
  classification: "tree",
  treediagram: "tree",
  code: "code",
  codeblock: "code",
  solvedproblem: "solvedProblem",
  workedproblem: "solvedProblem",
  flashcards: "flashcards",
  flashcardpair: "flashcards",
  glossary: "glossary",
  keyterms: "glossary",
  takeaways: "takeaways",
  keytakeaways: "takeaways",
  quiz: "quiz",
  quickquiz: "quiz",
};

const BLOCK_CONTRACT = `Each block is an object with "type" and the fields that type needs:
- chapterHeader: title, badge ("01"), text (a 1-2 sentence chapter overview)
- paragraph: title (short), text (2-4 substantial paragraphs, each 2-4 sentences)
- bulletList: title, items (3-7 short strings)
- definition: title (the term), text (a precise definition plus why it matters)
- formula: title, formula (LaTeX without $ delimiters), text (what each symbol means and when to use it)
- example: title, text (a concrete, real-world worked illustration)
- callout: tone ("important" | "warning" | "examTip" | "insight"), title, text
- prosCons: title, pros (2-4 strings), cons (2-4 strings)
- comparisonTable: title, headers (2-4 strings), rows (3-5 arrays of strings, each the same length as headers)
- flowchart: title, mermaid (a valid Mermaid "flowchart TD" or "flowchart LR" definition), text (optional caption)
- steps: title, steps (3-6 objects {"title","detail"})
- tree: title, mermaid (a valid Mermaid "flowchart TD" classification/hierarchy), text (optional caption)
- code: title, language, code (a real, runnable example with comments), text (short explanation)
- solvedProblem: title, text (the problem), steps (3-6 objects {"title","detail"} showing the worked reasoning)
- flashcards: title, pairs (3-6 objects {"front","back"})
- glossary: title, terms (4-8 objects {"term","definition"})
- takeaways: title, items (3-6 strings)
- quiz: title, pairs (3-6 objects {"front": question, "back": answer})
Every block must include "source": "ai". Do not use markdown, bullet characters, or code fences inside plain text fields.`;

function stripFences(raw: string) {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function extractJson(raw: string): unknown {
  const text = stripFences(raw);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("The model did not return JSON.");
  }
  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    // A very common failure: trailing commas before a closing brace.
    return JSON.parse(candidate.replace(/,\s*([}\]])/g, "$1"));
  }
}

async function complete(messages: { role: "system" | "user" | "assistant"; content: string }[], maxTokens: number) {
  let lastError = "The AI service did not respond.";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    // A non-reasoning model is essential here: the pipeline needs its whole
    // token budget for visible JSON, not hidden chain-of-thought tokens.
    const result = await vly.ai.completion({ model: "gpt-4o", messages, maxTokens });
    if (result.success && result.data) {
      const content = result.data.choices?.[0]?.message?.content ?? "";
      if (content.trim()) return content;
      lastError = "The AI service returned an empty response.";
    } else {
      lastError = result.error || "The AI service rejected the request.";
    }
  }
  throw new Error(lastError);
}

async function completeJson<T>(
  system: string,
  user: string,
  maxTokens: number,
): Promise<T> {
  const raw = await complete(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    maxTokens,
  );
  try {
    return extractJson(raw) as T;
  } catch {
    const repaired = await complete(
      [
        {
          role: "system",
          content:
            "You repair malformed JSON. Return only the corrected JSON object, with no prose and no code fences.",
        },
        {
          role: "user",
          content: `Make this valid JSON while preserving all content:\n\n${raw.slice(0, 12000)}`,
        },
      ],
      maxTokens,
    );
    return extractJson(repaired) as T;
  }
}

function cleanText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  return value.replace(/```/g, "").replace(/\r/g, "").trim() || fallback;
}

function cleanList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanText(item))
    .filter(Boolean)
    .slice(0, 10);
}

function cleanMermaid(value: unknown): string {
  const raw = cleanText(value)
    .replace(/^```(?:mermaid)?/i, "")
    .replace(/```$/i, "")
    .trim();
  if (!/^(flowchart|graph|sequenceDiagram|mindmap|classDiagram)\b/.test(raw)) return "";
  return raw.slice(0, 1600);
}

function normalizeBlock(raw: unknown, keyPrefix: string): NoteBlock | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const rawsType = cleanText(source.type).toLowerCase().replace(/[\s_-]/g, "");
  const type = TYPE_ALIASES[rawsType] ?? (ALLOWED_TYPES.has(cleanText(source.type)) ? cleanText(source.type) : "");
  if (!type) return null;

  const id = `${keyPrefix}-${Math.random().toString(36).slice(2, 8)}`;
  const base: NoteBlock = { id, type: type as NoteBlock["type"], source: "ai" };
  const title = cleanText(source.title).slice(0, 180);
  const text = cleanText(source.text).slice(0, 4000);
  if (title) base.title = title;
  if (text) base.text = text;

  switch (type) {
    case "chapterHeader": {
      if (!title) return null;
      base.badge = cleanText(source.badge, "01").replace(/[^0-9A-Za-z]/g, "").slice(0, 3) || "01";
      return base;
    }
    case "paragraph":
      return text ? base : null;
    case "bulletList":
    case "takeaways": {
      const items = cleanList(source.items);
      if (!title && !items.length) return null;
      base.items = items.length ? items : [text || "Add a key point"];
      return base;
    }
    case "definition":
      return title && text ? base : null;
    case "formula": {
      const formula = cleanText(source.formula || source.latex || source.text);
      if (!formula) return null;
      base.formula = formula;
      base.text = text && text !== formula ? text : "What each symbol means and when to use this formula.";
      return base;
    }
    case "example":
      return title && text ? base : null;
    case "callout": {
      if (!text) return null;
      const tone = cleanText(source.tone);
      base.tone = ["important", "warning", "examTip", "insight"].includes(tone)
        ? (tone as NoteBlock["tone"])
        : "important";
      if (!base.title) base.title = "Important";
      return base;
    }
    case "prosCons": {
      const pros = cleanList(source.pros);
      const cons = cleanList(source.cons);
      if (!pros.length && !cons.length) return null;
      base.pros = pros;
      base.cons = cons;
      return base;
    }
    case "comparisonTable": {
      const headers = cleanList(source.headers).slice(0, 5);
      const rawRows = Array.isArray(source.rows) ? source.rows : [];
      const rows = rawRows
        .map((row) => (Array.isArray(row) ? row.map((cell) => cleanText(cell)).slice(0, headers.length) : []))
        .filter((row) => row.length >= 2);
      if (headers.length < 2 || !rows.length) return null;
      base.headers = headers;
      base.rows = rows;
      return base;
    }
    case "flowchart":
    case "tree": {
      const mermaid = cleanMermaid(source.mermaid || source.code || source.diagram);
      if (!mermaid) return null;
      base.mermaid = mermaid;
      return base;
    }
    case "steps":
    case "solvedProblem": {
      const rawSteps = Array.isArray(source.steps) ? source.steps : [];
      const steps = rawSteps
        .map((step) => {
          const row = step as Record<string, unknown>;
          return {
            title: cleanText(row.title || row.label),
            detail: cleanText(row.detail || row.text || row.description),
          };
        })
        .filter((step) => step.title || step.detail)
        .slice(0, 8);
      if (!steps.length) return null;
      base.steps = steps;
      if (type === "solvedProblem" && !text) {
        base.text = title ? `Work through this problem: ${title}.` : "Work through the problem below.";
      }
      return base;
    }
    case "code": {
      const code = cleanText(source.code, "").slice(0, 2600);
      if (!code) return null;
      base.code = code;
      base.language = cleanText(source.language, "text").toLowerCase().slice(0, 20) || "text";
      return base;
    }
    case "flashcards":
    case "quiz": {
      const rawPairs = Array.isArray(source.pairs) ? source.pairs : [];
      const pairs = rawPairs
        .map((pair) => {
          const row = pair as Record<string, unknown>;
          return {
            front: cleanText(row.front || row.question || row.q),
            back: cleanText(row.back || row.answer || row.a),
          };
        })
        .filter((pair) => pair.front && pair.back)
        .slice(0, 8);
      if (!pairs.length) return null;
      base.pairs = pairs;
      return base;
    }
    case "glossary": {
      const rawTerms = Array.isArray(source.terms) ? source.terms : [];
      const terms = rawTerms
        .map((term) => {
          const row = term as Record<string, unknown>;
          return { term: cleanText(row.term || row.name), definition: cleanText(row.definition || row.meaning) };
        })
        .filter((term) => term.term && term.definition)
        .slice(0, 10);
      if (!terms.length) return null;
      base.terms = terms;
      return base;
    }
    default:
      return null;
  }
}

function chapterNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function detailTarget(detail: DetailLevel) {
  switch (detail) {
    case "standard":
      return { blocks: "5-6", words: "650-850" };
    case "detailed":
      return { blocks: "6-8", words: "900-1100" };
    case "comprehensive":
      return { blocks: "8-10", words: "1400-1800" };
    default:
      return { blocks: "7-9", words: "1100-1400" };
  }
}

const SYSTEM_PROMPT =
  "You are NoteForge, a senior teacher and instructional designer who writes study notes that feel like a beautifully produced textbook. You explain ideas in plain language, build from first principles, use precise technical vocabulary, give concrete examples, and never pad with filler. You are rigorous about factual accuracy: if you are not sure about a specific statistic, name or date, describe the idea without inventing it. You always return valid JSON in exactly the requested shape.";

function outlinePrompt(topic: string, settings: NoteSettings, chapterCount: number) {
  return `Design the structure for a comprehensive study guide.

TOPIC: ${topic}
LANGUAGE: write everything in ${settings.language}
AUDIENCE: ${settings.audience}
GOAL: ${settings.mode === "exam" ? "exam-oriented — prioritise definitions, comparisons, likely exam questions and mark-scheme language" : "concept-oriented — prioritise deep understanding, mental models and real-world intuition"}
DEPTH: ${settings.detail} (build ${chapterCount} chapters)
${settings.customInstruction ? `LEARNER'S CUSTOM INSTRUCTION: ${settings.customInstruction}` : ""}

Create ${chapterCount} chapters that together cover the topic completely, from foundations to application. Each chapter needs a clear theme, 4-7 concrete subtopics, and 3-6 technical key terms. Avoid overlap between chapters and make sure the sequence teaches prerequisites before dependents.

Return ONLY this JSON:
{
  "title": "A specific, inviting title (not 'Introduction to ...')",
  "subtitle": "One sentence describing what the learner will be able to do after studying this",
  "subject": "Short subject label, e.g. Biology or Linear Algebra",
  "chapters": [
    {
      "title": "Chapter title",
      "summary": "1-2 sentences on what this chapter establishes",
      "topics": ["specific subtopic", "specific subtopic", "specific subtopic"],
      "keyTerms": ["term", "term", "term"]
    }
  ],
  "warnings": []
}`;
}

function chapterPrompt(
  topic: string,
  outline: Outline,
  chapter: OutlineChapter,
  index: number,
  settings: NoteSettings,
) {
  const target = detailTarget(settings.detail);
  const layouts = [
    "paragraph",
    "bulletList",
    "definition",
    "formula (only when the topic involves mathematics)",
    "example (only when useful)",
    "callout",
    "prosCons",
    "comparisonTable",
    "flowchart (only when describing a process)",
    "steps",
    "tree (only for classification or hierarchy)",
    "code (only for programming topics)",
    "solvedProblem (only for numerical or procedural topics)",
    "flashcards",
    "glossary",
    "takeaways",
    "quiz",
  ]
    .filter((layout) => {
      if (layout.startsWith("example") && !settings.examples) return false;
      if (layout.startsWith("flowchart") && !settings.diagrams) return false;
      if (layout.startsWith("tree") && !settings.diagrams) return false;
      if (layout.startsWith("quiz") && !settings.practice) return false;
      if (layout.startsWith("flashcards") && !settings.practice) return false;
      return true;
    })
    .join(", ");

  return `Write chapter ${index + 1} of ${outline.chapters.length} for a study guide on "${topic}".

GUIDE TITLE: ${outline.title}
SUBJECT: ${outline.subject}
AUDIENCE: ${settings.audience}
LANGUAGE: ${settings.language}
GOAL: ${settings.mode === "exam" ? "exam-oriented; include definitions, comparisons and likely exam questions" : "concept-oriented; build intuition, then precision"}
${settings.customInstruction ? `LEARNER'S CUSTOM INSTRUCTION: ${settings.customInstruction}` : ""}

THE FULL CHAPTER MAP (for continuity, do not repeat other chapters):
${outline.chapters.map((item, i) => `${i + 1}. ${item.title} — ${item.summary}`).join("\n")}

THIS CHAPTER:
${JSON.stringify(chapter, null, 2)}

Write ${target.blocks} blocks and AT LEAST ${target.words.split("-")[0]} words of prose. This is a study guide, not a summary. Requirements:
1. Start with a chapterHeader block. title = the chapter title, badge = "${chapterNumber(index)}", text = a 1-2 sentence overview.
2. Teach every subtopic above in a logical order. Do not merely list them; explain how and why. Every paragraph block must contain 150-220 words of genuine explanation (use 2-4 paragraphs), and a definition must be at least 50 words. Depth beats breadth: it is better to explain one mechanism fully than to mention five in one line.
3. Use varied layouts from this allowed set: ${layouts}. At least 3 different block types besides chapterHeader. Never use two paragraphs in a row without a visual break between them.
4. Use accurate technical terms, then explain them in plain language. Include at least one definition or glossary block.
5. ${settings.examples ? "Include at least one concrete example or real-world application." : "Skip extended examples; stay focused on explanation."}
6. ${settings.diagrams ? "If the chapter explains a process, cycle or classification, include one Mermaid diagram (flowchart or tree)." : "Do not include diagrams."}
7. ${settings.practice ? "End the chapter with either a takeaways block, a quiz block (with answers), or both." : "Do not include a quiz. A short takeaways block is welcome."}
8. Write for real understanding: define, explain, illustrate, then check. No filler like 'In this chapter we will explore'.

${BLOCK_CONTRACT}

Return ONLY JSON: {"blocks": [ ... ]}`;
}

function closingPrompt(topic: string, outline: Outline, settings: NoteSettings) {
  return `Write the final revision chapter for a study guide on "${topic}".
LANGUAGE: ${settings.language}
AUDIENCE: ${settings.audience}
GOAL: ${settings.mode === "exam" ? "exam-oriented" : "concept-oriented"}
CHAPTERS COVERED:
${outline.chapters.map((c) => `- ${c.title}: ${c.summary}`).join("\n")}

Create 3-4 blocks, beginning with a chapterHeader:
- chapterHeader: title "Revision & practice", badge "${chapterNumber(outline.chapters.length)}", text a short, encouraging overview.
- takeaways: the highest-value lessons across the whole guide (5-6 items).
${settings.practice ? '- quiz: 4 exam-style questions with full answers, mixing recall, application and analysis.' : ""}
${settings.mode === "exam" ? '- callout with tone "examTip" and practical exam strategy.' : ""}

No new topics. Every fact must already appear in the chapter map.

${BLOCK_CONTRACT}

Return ONLY JSON: {"blocks": [ ... ]}`;
}

export const generate = action({
  args: { id: v.id("noteProjects") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please sign in to generate notes.");

    const project = await ctx.runQuery(internal.notes.getOwned, { id, userId });
    if (!project) throw new Error("That study set is not available.");

    const claimed = await ctx.runMutation(internal.notes.claimGeneration, { id });
    if (!claimed) {
      // Already running or already finished: never start a second pipeline.
      return { ok: true, skipped: true };
    }

    const settings = project.settings as NoteSettings;
    const topic = project.topic;
    const chapterCount =
      DETAIL_LEVELS.find((level) => level.id === settings.detail)?.chapters ?? 5;

    const update = (patch: Record<string, unknown>) =>
      ctx.runMutation(internal.notes.patch, { id, ...patch });

    try {
      await update({
        status: "generating",
        stage: "reading",
        stageDetail: "Reading and scoping your topic",
        progress: 5,
        error: undefined,
        blocks: [],
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      await update({
        stage: "understanding",
        stageDetail: "Mapping concepts, terms and prerequisites",
        progress: 12,
      });

      const outline = await completeJson<Outline>(
        SYSTEM_PROMPT,
        outlinePrompt(topic, settings, chapterCount),
        2200,
      );

      if (!outline || !Array.isArray(outline.chapters) || !outline.chapters.length) {
        throw new Error("The outline step did not return chapters. Please try again.");
      }
      outline.chapters = outline.chapters.slice(0, 7).map((chapter, index) => ({
        title: cleanText(chapter.title, `Chapter ${index + 1}`),
        summary: cleanText(chapter.summary),
        topics: cleanList(chapter.topics),
        keyTerms: cleanList(chapter.keyTerms),
      }));

      await update({
        stage: "structuring",
        stageDetail: `Designed ${outline.chapters.length} chapters`,
        progress: 20,
        outline,
        notes: {
          title: cleanText(outline.title, project.title),
          subtitle: cleanText(outline.subtitle),
          subject: cleanText(outline.subject, topic),
        },
      });

      const hero: NoteBlock = {
        id: "hero",
        type: "hero",
        title: cleanText(outline.title, project.title),
        subtitle: cleanText(outline.subtitle, `A complete study guide to ${topic}.`),
        badge: `${cleanText(outline.subject, "Study notes")} · Study notes`,
        text: `Written for ${settings.audience.toLowerCase()} · ${outline.chapters.length} chapters · ${settings.mode === "exam" ? "exam-oriented" : "concept-oriented"}`,
        source: "ai",
      };
      await update({ appendBlocks: [hero], progress: 24 });

      const warnings: string[] = [];
      const collected: NoteBlock[] = [];
      const writtenChapters = new Set<string>();

      for (let index = 0; index < outline.chapters.length; index += 1) {
        const chapter = outline.chapters[index];
        const progress = 26 + Math.round((index / outline.chapters.length) * 56);
        await update({
          stage: "writing",
          stageDetail: `Writing chapter ${index + 1} of ${outline.chapters.length}: ${chapter.title}`,
          progress,
        });

        try {
          const result = await completeJson<{ blocks?: unknown[] }>(
            SYSTEM_PROMPT,
            chapterPrompt(topic, outline, chapter, index, settings),
            settings.detail === "comprehensive" ? 5000 : 4000,
          );
          const rawBlocks = Array.isArray(result.blocks) ? result.blocks : [];
          const blocks = rawBlocks
            .map((block, blockIndex) =>
              normalizeBlock(block, `c${index + 1}b${blockIndex}`),
            )
            .filter((block): block is NoteBlock => block !== null);

          if (!blocks.length) {
            throw new Error("The writer returned no usable blocks.");
          }

          // Guarantee every chapter opens with its own header.
          if (blocks[0]?.type !== "chapterHeader") {
            blocks.unshift({
              id: `c${index + 1}-header`,
              type: "chapterHeader",
              title: chapter.title,
              badge: chapterNumber(index),
              text: chapter.summary,
              source: "ai",
            });
          }

          if (blocks[0].type === "chapterHeader") {
            blocks[0] = {
              ...blocks[0],
              badge: chapterNumber(index),
              title: blocks[0].title || chapter.title,
            };
          }

          writtenChapters.add(chapter.title);
          collected.push(...blocks);
          await update({ appendBlocks: blocks });
          await new Promise((resolve) => setTimeout(resolve, 180));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          warnings.push(
            `Chapter "${chapter.title}" could not be written (${message}). The rest of the guide is intact — regenerate to fill the gap.`,
          );
          await update({
            appendBlocks: [
              {
                id: `c${index + 1}-header-fallback`,
                type: "chapterHeader",
                title: chapter.title,
                badge: chapterNumber(index),
                text: chapter.summary,
                source: "ai",
              },
            ],
          });
        }
      }

      await update({
        stage: "designing",
        stageDetail: settings.practice ? "Adding revision and practice" : "Finalising layout and study aids",
        progress: 88,
      });

      try {
        const closing = await completeJson<{ blocks?: unknown[] }>(
          SYSTEM_PROMPT,
          closingPrompt(topic, outline, settings),
          2600,
        );
        const closingBlocks = (Array.isArray(closing.blocks) ? closing.blocks : [])
          .map((block, index) => normalizeBlock(block, `close${index}`))
          .filter((block): block is NoteBlock => block !== null);
        if (closingBlocks.length) {
          collected.push(...closingBlocks);
          await update({ appendBlocks: closingBlocks });
        }
      } catch {
        warnings.push("The revision chapter could not be generated. Your chapter notes are complete.");
      }

      // Quality pass: remove exact duplicates and verify every planned chapter exists.
      const seen = new Set<string>();
      const deduped = collected.filter((block) => {
        const signature = `${block.type}|${block.title ?? ""}|${block.text ?? ""}|${block.mermaid ?? ""}`;
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
      });

      const missing = outline.chapters
        .filter((chapter) => !writtenChapters.has(chapter.title))
        .map((chapter) => chapter.title);
      if (missing.length) {
        warnings.push(`These chapters need another pass: ${missing.join(", ")}.`);
      }

      await update({
        status: "ready",
        stage: "done",
        stageDetail: "Notes ready",
        progress: 100,
        warnings,
        notes: {
          title: cleanText(outline.title, project.title),
          subtitle: cleanText(outline.subtitle),
          subject: cleanText(outline.subject, topic),
        },
        blocks: [hero, ...deduped],
      });

      return { ok: true };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while generating your notes.";
      await update({
        status: "error",
        stage: "error",
        stageDetail: "Generation stopped",
        error:
          /VLY_INTEGRATION_KEY|not configured|unauthor/i.test(message)
            ? "The AI service is not configured yet. Add your AI integration key and try again."
            : message,
      });
      return { ok: false, error: message };
    }
  },
});
