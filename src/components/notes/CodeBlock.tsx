import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TokenKind = "plain" | "keyword" | "string" | "comment" | "number" | "fn";

const KEYWORDS = new Set([
  "function", "const", "let", "var", "if", "else", "for", "while", "return", "def",
  "class", "import", "from", "as", "with", "try", "except", "finally", "print",
  "True", "False", "None", "public", "private", "static", "void", "new", "int",
  "float", "double", "String", "bool", "async", "await", "yield", "in", "not",
  "and", "or", "select", "where", "group", "by", "order", "join", "lambda",
  "self", "this", "null", "undefined", "export", "default", "interface", "type",
  "struct", "include", "using", "namespace", "end", "then", "do", "elif", "pass",
  "raise", "match", "case", "switch", "break", "continue", "foreach", "func",
  "fn", "impl", "package", "extends", "implements", "throws", "catch",
]);

function tokenize(code: string): { text: string; kind: TokenKind }[] {
  const tokens: { text: string; kind: TokenKind }[] = [];
  let buffer = "";
  let index = 0;

  const flush = () => {
    if (buffer) {
      tokens.push({ text: buffer, kind: "plain" });
      buffer = "";
    }
  };
  const push = (text: string, kind: TokenKind) => {
    flush();
    tokens.push({ text, kind });
  };

  while (index < code.length) {
    const char = code[index];
    const next = code[index + 1];

    if (char === "/" && next === "/") {
      const end = code.indexOf("\n", index);
      const stop = end === -1 ? code.length : end;
      push(code.slice(index, stop), "comment");
      index = stop;
      continue;
    }
    if (char === "-" && next === "-") {
      const end = code.indexOf("\n", index);
      const stop = end === -1 ? code.length : end;
      push(code.slice(index, stop), "comment");
      index = stop;
      continue;
    }
    if (char === "#") {
      const end = code.indexOf("\n", index);
      const stop = end === -1 ? code.length : end;
      push(code.slice(index, stop), "comment");
      index = stop;
      continue;
    }
    if (char === "/" && next === "*") {
      const end = code.indexOf("*/", index);
      const stop = end === -1 ? code.length : end + 2;
      push(code.slice(index, stop), "comment");
      index = stop;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      let stop = index + 1;
      while (stop < code.length) {
        if (code[stop] === "\\") {
          stop += 2;
          continue;
        }
        if (code[stop] === char) {
          stop += 1;
          break;
        }
        stop += 1;
      }
      push(code.slice(index, stop), "string");
      index = stop;
      continue;
    }
    if (/[0-9]/.test(char) && (index === 0 || !/[\w$]/.test(code[index - 1]))) {
      const match = /^[0-9][0-9._xXa-fA-F]*/.exec(code.slice(index));
      if (match) {
        push(match[0], "number");
        index += match[0].length;
        continue;
      }
    }
    if (/[A-Za-z_$]/.test(char)) {
      const match = /^[A-Za-z_$][\w$]*/.exec(code.slice(index));
      if (match) {
        const word = match[0];
        const rest = code.slice(index + word.length);
        if (KEYWORDS.has(word)) push(word, "keyword");
        else if (/^\s*\(/.test(rest)) push(word, "fn");
        else buffer += word;
        index += word.length;
        continue;
      }
    }

    buffer += char;
    index += 1;
  }
  flush();
  return tokens;
}

const COLOR: Record<TokenKind, string | undefined> = {
  plain: undefined,
  keyword: "var(--np-accent)",
  string: "var(--np-accent-2)",
  comment: "var(--np-muted)",
  number: "color-mix(in oklab, var(--np-accent) 55%, #ffb86b)",
  fn: "var(--np-heading)",
};

const LANGUAGES = [
  "python", "javascript", "typescript", "java", "c", "cpp", "csharp", "go",
  "rust", "sql", "bash", "html", "css", "json", "text",
];

export function CodeBlock({
  code,
  language,
  editable,
  onCommit,
  onLanguage,
  className,
}: {
  code: string;
  language?: string;
  editable?: boolean;
  onCommit?: (value: string) => void;
  onLanguage?: (value: string) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState(code);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDraft(code);
  }, [code]);

  const tokens = useMemo(() => tokenize(code), [code]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={cn("overflow-hidden rounded-xl border", className)} style={{ borderColor: "var(--np-border-strong)", background: "var(--np-code-bg)" }}>
      <div
        className="flex items-center justify-between gap-3 border-b px-4 py-2"
        style={{ borderColor: "color-mix(in oklab, var(--np-border) 80%, transparent)" }}
      >
        {editable ? (
          <select
            aria-label="Code language"
            value={language ?? "text"}
            onChange={(event) => onLanguage?.(event.target.value)}
            className="np-mono rounded-md border-0 bg-transparent px-1 py-0.5 text-[11px] uppercase tracking-[0.16em] outline-none"
            style={{ color: "var(--np-muted)" }}
          >
            {LANGUAGES.map((item) => (
              <option key={item} value={item} style={{ color: "#1c1f2b", background: "#ffffff" }}>
                {item}
              </option>
            ))}
          </select>
        ) : (
          <span className="np-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--np-muted)" }}>
            {language || "code"}
          </span>
        )}
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] transition-opacity hover:opacity-100"
          style={{ color: "var(--np-muted)", opacity: 0.85 }}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {editable ? (
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            if (draft !== code) onCommit?.(draft);
          }}
          spellCheck={false}
          aria-label="Code"
          className="np-mono block w-full resize-y bg-transparent px-4 py-4 text-[13px] leading-6 outline-none"
          style={{ color: "var(--np-code-fg)", minHeight: 132 }}
        />
      ) : (
        <pre className="np-mono overflow-x-auto px-4 py-4 text-[13px] leading-6" style={{ color: "var(--np-code-fg)" }}>
          <code>
            {tokens.map((token, index) => (
              <span
                key={index}
                style={{
                  color: COLOR[token.kind],
                  fontStyle: token.kind === "comment" ? "italic" : undefined,
                  opacity: token.kind === "comment" ? 0.75 : undefined,
                }}
              >
                {token.text}
              </span>
            ))}
          </code>
        </pre>
      )}
    </div>
  );
}
