import { useEffect, useId, useRef, useState } from "react";

let mermaidInitialised = false;

export function MermaidDiagram({
  chart,
  dark,
  className,
}: {
  chart: string;
  dark?: boolean;
  className?: string;
}) {
  const rawId = useId();
  const domId = `nf-diagram-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!chart.trim()) return;
    let cancelled = false;
    setError(null);
    setSvg("");

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          fontFamily: "Inter, sans-serif",
          themeVariables: {
            background: "transparent",
            primaryColor: dark ? "#232a44" : "#eef2ff",
            primaryTextColor: dark ? "#e6e9f5" : "#242938",
            primaryBorderColor: dark ? "#6f7dc9" : "#b6c0e8",
            secondaryColor: dark ? "#1b2033" : "#f4f3ee",
            tertiaryColor: dark ? "#151926" : "#faf9f5",
            lineColor: dark ? "#8f99b8" : "#8d94a8",
            textColor: dark ? "#dde1ee" : "#2b3040",
            fontSize: "15px",
            nodeBorder: dark ? "#6f7dc9" : "#b6c0e8",
            clusterBkg: "transparent",
            edgeLabelBackground: dark ? "#141824" : "#ffffff",
          },
        });
        mermaidInitialised = true;
        const { svg: rendered } = await mermaid.render(domId, chart);
        if (!cancelled && mounted.current) setSvg(rendered);
      } catch (err) {
        if (!cancelled && mounted.current) {
          setError(err instanceof Error ? err.message : "This diagram could not be drawn.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, dark, domId]);

  if (error) {
    return (
      <div
        className="rounded-xl border border-dashed p-4 text-xs leading-5"
        style={{ borderColor: "var(--np-border-strong)", color: "var(--np-muted)" }}
      >
        <p className="font-medium" style={{ color: "var(--np-fg)" }}>
          Diagram preview unavailable
        </p>
        <p className="mt-1">The diagram source is still saved and editable. {error}</p>
      </div>
    );
  }

  if (!svg) {
    return (
      <div
        className="flex h-40 items-center justify-center rounded-xl border border-dashed"
        style={{ borderColor: "var(--np-border)", color: "var(--np-muted)" }}
      >
        <span className="text-xs tracking-wide">Drawing diagram…</span>
      </div>
    );
  }

  return (
    <div
      className={className}
      // SVG is produced and sanitised by Mermaid (securityLevel: strict).
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export const mermaidReady = () => mermaidInitialised;
