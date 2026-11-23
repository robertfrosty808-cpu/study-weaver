import katex from "katex";
import { useMemo } from "react";

export function Formula({ value, className }: { value: string; className?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(value || "\\;", {
        displayMode: true,
        throwOnError: false,
        strict: false,
        trust: false,
      });
    } catch {
      return null;
    }
  }, [value]);

  if (!html) {
    return (
      <p className="np-mono text-sm" style={{ color: "var(--np-muted)" }}>
        {value}
      </p>
    );
  }

  return (
    <div
      className={className}
      // KaTeX output is generated locally from the stored formula string.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
