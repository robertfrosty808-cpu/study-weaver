import { cn } from "@/lib/utils";
import type { NoteBlock } from "@/lib/note-types";
import {
  AlertTriangle,
  BookMarked,
  BookOpen,
  Check,
  ChevronDown,
  GraduationCap,
  Lightbulb,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { EditableText } from "./EditableText";
import { Formula } from "./Formula";
import { MermaidDiagram } from "./MermaidDiagram";

export interface BlockViewProps {
  block: NoteBlock;
  editable?: boolean;
  onChange?: (patch: Partial<NoteBlock>) => void;
  themeDark?: boolean;
}

const EYEBROW = "text-[10px] font-semibold uppercase tracking-[0.2em]";

function SourceTag({ block }: { block: NoteBlock }) {
  if (!block.source) return null;
  const fromFile = block.source === "source";
  return (
    <div
      className="mt-4 flex select-none items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] opacity-60"
      style={{ color: "var(--np-muted)" }}
      aria-label={fromFile ? "From your file" : "AI explanation"}
    >
      {fromFile ? <BookOpen className="size-3" /> : <Sparkles className="size-3" />}
      <span>
        {fromFile ? "From your file" : "AI explanation"}
        {block.pageRef ? ` · ${block.pageRef}` : ""}
      </span>
    </div>
  );
}

function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed px-2.5 py-1.5 text-[11px] font-medium opacity-70 transition hover:opacity-100"
      style={{ borderColor: "var(--np-border-strong)", color: "var(--np-muted)" }}
    >
      <Plus className="size-3" /> {label}
    </button>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="ml-auto shrink-0 rounded p-0.5 opacity-0 transition group-hover/item:opacity-60 hover:!opacity-100"
      style={{ color: "var(--np-muted)" }}
    >
      <X className="size-3.5" />
    </button>
  );
}

function SectionTitle({
  value,
  editable,
  onCommit,
  className,
}: {
  value?: string;
  editable?: boolean;
  onCommit?: (value: string) => void;
  className?: string;
}) {
  if (!value && !editable) return null;
  return (
    <EditableText
      as="h3"
      value={value}
      editable={editable}
      placeholder="Add a title"
      singleLine
      onCommit={onCommit}
      className={cn("np-heading text-xl font-bold tracking-tight", className)}
    />
  );
}

function FormulaInput({ value, onCommit }: { value: string; onCommit: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <input
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (draft !== value) onCommit(draft);
      }}
      aria-label="LaTeX formula"
      spellCheck={false}
      className="np-mono w-full max-w-sm rounded-lg border px-3 py-1.5 text-xs"
      style={{ borderColor: "var(--np-border-strong)", background: "var(--np-bg-soft)", color: "var(--np-fg)" }}
    />
  );
}

function DiagramSourceEditor({ value, onCommit }: { value: string; onCommit: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  return (
    <details className="group mt-3">
      <summary
        className="inline-flex cursor-pointer list-none items-center gap-1 text-[11px] font-medium opacity-60 hover:opacity-100"
        style={{ color: "var(--np-muted)" }}
      >
        <ChevronDown className="size-3 transition group-open:rotate-180" />
        Edit diagram source
      </summary>
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft !== value) onCommit(draft);
        }}
        spellCheck={false}
        rows={7}
        aria-label="Mermaid diagram source"
        className="np-mono mt-2 w-full rounded-lg border p-3 text-xs leading-5 outline-none"
        style={{
          borderColor: "var(--np-border-strong)",
          background: "var(--np-code-bg)",
          color: "var(--np-code-fg)",
        }}
      />
    </details>
  );
}

function Callout({ block, editable, commit }: { block: NoteBlock; editable: boolean; commit: (patch: Partial<NoteBlock>) => void }) {
  const tone = block.tone ?? "important";
  const tones = {
    important: { color: "var(--np-accent)", soft: "var(--np-accent-soft)", label: "Important", Icon: Lightbulb },
    warning: { color: "color-mix(in oklab, #e09a2f 58%, var(--np-heading))", soft: "color-mix(in oklab, #f59e0b 15%, transparent)", label: "Watch out", Icon: AlertTriangle },
    examTip: { color: "var(--np-accent-2)", soft: "var(--np-accent-2-soft)", label: "Exam tip", Icon: GraduationCap },
    insight: { color: "var(--np-accent)", soft: "var(--np-accent-soft)", label: "Insight", Icon: Sparkles },
  } as const;
  const current = tones[tone] ?? tones.important;
  const Icon = current.Icon;

  return (
    <aside
      className="relative overflow-hidden rounded-2xl border p-5 sm:p-6"
      style={{ background: current.soft, borderColor: `color-mix(in oklab, ${current.color} 28%, transparent)` }}
    >
      <div className="flex items-start gap-3.5">
        <div
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `color-mix(in oklab, ${current.color} 18%, transparent)`, color: current.color }}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={EYEBROW} style={{ color: current.color }}>
              {current.label}
            </span>
            {editable && (
              <select
                aria-label="Callout type"
                value={tone}
                onChange={(event) => commit({ tone: event.target.value as NoteBlock["tone"] })}
                className="rounded-md border px-1.5 py-0.5 text-[10px]"
                style={{ borderColor: "var(--np-border)", background: "var(--np-card)", color: "var(--np-fg)" }}
              >
                <option value="important">Important</option>
                <option value="warning">Warning</option>
                <option value="examTip">Exam tip</option>
                <option value="insight">Insight</option>
              </select>
            )}
          </div>
          <EditableText
            as="p"
            value={block.title}
            editable={editable}
            singleLine
            placeholder="Callout heading"
            onCommit={(title) => commit({ title })}
            className="np-heading mt-1.5 text-lg font-bold leading-snug"
          />
          <EditableText
            as="p"
            value={block.text}
            editable={editable}
            placeholder="Write the note…"
            onCommit={(text) => commit({ text })}
            className="mt-1.5 text-[15px] leading-7"
          />
        </div>
      </div>
      <SourceTag block={block} />
    </aside>
  );
}

export function BlockView({ block, editable = false, onChange, themeDark }: BlockViewProps) {
  const canEdit = editable && Boolean(onChange);
  const commit = (patch: Partial<NoteBlock>) => onChange?.(patch);
  const text = block.text ?? "";
  const title = block.title ?? "";

  switch (block.type) {
    case "hero":
      return (
        <header
          className="relative overflow-hidden rounded-[28px] px-6 py-10 sm:px-12 sm:py-14"
          style={{
            background: "linear-gradient(145deg, var(--np-card-soft) 0%, var(--np-card) 55%)",
            border: "1px solid var(--np-border-strong)",
            boxShadow: "var(--np-shadow)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full blur-3xl"
            style={{ background: "var(--np-accent)", opacity: 0.16 }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 left-1/4 size-64 rounded-full blur-3xl"
            style={{ background: "var(--np-accent-2)", opacity: 0.1 }}
          />
          <div className="relative">
            <div
              className="mb-6 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--np-accent)" }}
            >
              <Sparkles className="size-3.5" />
              <EditableText
                as="span"
                value={block.badge}
                editable={canEdit}
                singleLine
                placeholder="Subject · Study notes"
                onCommit={(badge) => commit({ badge })}
              />
            </div>
            <EditableText
              as="h1"
              value={title}
              editable={canEdit}
              singleLine
              placeholder="Give this guide a title"
              onCommit={(value) => commit({ title: value })}
              className="np-heading max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl"
            />
            <EditableText
              as="p"
              value={block.subtitle}
              editable={canEdit}
              placeholder="A sentence on what the reader will be able to do"
              onCommit={(subtitle) => commit({ subtitle })}
              className="mt-5 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8"
            />
            <div className="mt-7 flex items-center gap-3">
              <div className="h-px w-10" style={{ background: "var(--np-accent)" }} />
              <EditableText
                as="p"
                value={text}
                editable={canEdit}
                placeholder="Audience · chapters · focus"
                onCommit={(value) => commit({ text: value })}
                className="np-mono text-[11px] uppercase tracking-[0.12em]"
              />
            </div>
          </div>
        </header>
      );

    case "chapterHeader":
      return (
        <section className="pt-5">
          <div className="mb-4 flex items-center gap-3">
            <span
              className="flex size-11 items-center justify-center rounded-2xl font-display text-lg font-extrabold tracking-tight"
              style={{ background: "var(--np-accent)", color: "var(--np-bg)" }}
            >
              <EditableText
                as="span"
                value={block.badge}
                editable={canEdit}
                singleLine
                placeholder="01"
                onCommit={(badge) => commit({ badge })}
                className="px-1 text-center"
              />
            </span>
            <span className={EYEBROW} style={{ color: "var(--np-muted)" }}>
              Chapter
            </span>
            <span className="h-px flex-1" style={{ background: "var(--np-border)" }} />
          </div>
          <EditableText
            as="h2"
            value={title}
            editable={canEdit}
            singleLine
            placeholder="Chapter title"
            onCommit={(value) => commit({ title: value })}
            className="np-heading text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl"
          />
          <EditableText
            as="p"
            value={text}
            editable={canEdit}
            placeholder="What this chapter establishes…"
            onCommit={(value) => commit({ text: value })}
            className="mt-3 max-w-2xl text-[15px] leading-7"
          />
        </section>
      );

    case "paragraph":
      return (
        <div>
          <SectionTitle value={title} editable={canEdit} onCommit={(value) => commit({ title: value })} className="mb-2.5" />
          <EditableText
            as="p"
            value={text}
            editable={canEdit}
            placeholder="Explain the idea…"
            onCommit={(value) => commit({ text: value })}
            className="whitespace-pre-wrap text-[15.5px] leading-[1.85] sm:text-base sm:leading-[1.9]"
          />
          <SourceTag block={block} />
        </div>
      );

    case "bulletList": {
      const items = block.items ?? [];
      return (
        <div className="np-soft rounded-2xl p-5 sm:p-6">
          <SectionTitle value={title} editable={canEdit} onCommit={(value) => commit({ title: value })} className="mb-4" />
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={index} className="group/item flex items-start gap-3">
                <span
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md"
                  style={{ background: "var(--np-accent-soft)", color: "var(--np-accent)" }}
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <EditableText
                  as="span"
                  value={item}
                  editable={canEdit}
                  placeholder="Key point"
                  onCommit={(value) => commit({ items: items.map((entry, i) => (i === index ? value : entry)) })}
                  className="min-w-0 flex-1 text-[15px] leading-7"
                />
                {canEdit && items.length > 1 && (
                  <RemoveButton label="Remove point" onClick={() => commit({ items: items.filter((_, i) => i !== index) })} />
                )}
              </li>
            ))}
          </ul>
          {canEdit && <AddRow label="Add point" onClick={() => commit({ items: [...items, ""] })} />}
          <SourceTag block={block} />
        </div>
      );
    }

    case "definition":
      return (
        <div className="np-card relative overflow-hidden p-6 sm:p-7">
          <div aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: "var(--np-accent)" }} />
          <div className="flex items-center gap-2" style={{ color: "var(--np-accent)" }}>
            <BookMarked className="size-4" />
            <span className={EYEBROW}>Definition</span>
          </div>
          <EditableText
            as="h3"
            value={title}
            editable={canEdit}
            singleLine
            placeholder="Term"
            onCommit={(value) => commit({ title: value })}
            className="np-heading mt-3 text-2xl font-extrabold tracking-tight"
          />
          <EditableText
            as="p"
            value={text}
            editable={canEdit}
            placeholder="Define the term precisely."
            onCommit={(value) => commit({ text: value })}
            className="mt-2.5 text-[15px] leading-7"
          />
          <SourceTag block={block} />
        </div>
      );

    case "formula":
      return (
        <div className="np-card p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2" style={{ color: "var(--np-accent)" }}>
              <span className="np-mono text-sm">∑</span>
              <span className={EYEBROW}>Formula</span>
            </div>
            {canEdit && (
              <FormulaInput value={block.formula ?? ""} onCommit={(formula) => commit({ formula })} />
            )}
          </div>
          <SectionTitle value={title} editable={canEdit} onCommit={(value) => commit({ title: value })} className="mt-3" />
          <div className="my-5 overflow-x-auto py-2 text-center text-lg sm:text-xl" style={{ color: "var(--np-heading)" }}>
            <Formula value={block.formula ?? ""} />
          </div>
          <EditableText
            as="p"
            value={text}
            editable={canEdit}
            placeholder="Explain each symbol and when to use it."
            onCommit={(value) => commit({ text: value })}
            className="border-t pt-4 text-sm leading-6"
          />
          <SourceTag block={block} />
        </div>
      );

    case "example":
      return (
        <div className="np-soft rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2" style={{ color: "var(--np-accent-2)" }}>
            <Lightbulb className="size-4" />
            <span className={EYEBROW}>Worked example</span>
          </div>
          <SectionTitle value={title} editable={canEdit} onCommit={(value) => commit({ title: value })} className="mt-2.5" />
          <EditableText
            as="p"
            value={text}
            editable={canEdit}
            placeholder="A concrete situation that makes the idea click."
            onCommit={(value) => commit({ text: value })}
            className="mt-2 text-[15px] leading-7"
          />
          <SourceTag block={block} />
        </div>
      );

    case "callout":
      return <Callout block={block} editable={canEdit} commit={commit} />;

    case "prosCons": {
      const pros = block.pros ?? [];
      const cons = block.cons ?? [];
      return (
        <div className="np-card p-5 sm:p-6">
          <SectionTitle value={title} editable={canEdit} onCommit={(value) => commit({ title: value })} className="mb-4" />
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                { key: "pros" as const, items: pros, label: "Advantages", Icon: Check, color: "var(--np-accent-2)", soft: "var(--np-accent-2-soft)" },
                { key: "cons" as const, items: cons, label: "Disadvantages", Icon: X, color: "color-mix(in oklab, #e05a4a 58%, var(--np-heading))", soft: "color-mix(in oklab, #ef6b5b 12%, transparent)" },
              ] as const
            ).map((column) => (
              <div key={column.key} className="rounded-xl p-4" style={{ background: column.soft }}>
                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: column.color }}>
                  <column.Icon className="size-3.5" strokeWidth={3} />
                  {column.label}
                </div>
                <ul className="space-y-2.5">
                  {column.items.map((item, index) => (
                    <li key={index} className="group/item flex items-start gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ background: column.color }} />
                      <EditableText
                        as="span"
                        value={item}
                        editable={canEdit}
                        placeholder="Point"
                        onCommit={(value) =>
                          commit({
                            [column.key]: column.items.map((entry, i) => (i === index ? value : entry)),
                          } as Partial<NoteBlock>)
                        }
                        className="min-w-0 flex-1 text-sm leading-6"
                      />
                      {canEdit && column.items.length > 1 && (
                        <RemoveButton
                          label="Remove point"
                          onClick={() =>
                            commit({
                              [column.key]: column.items.filter((_, i) => i !== index),
                            } as Partial<NoteBlock>)
                          }
                        />
                      )}
                    </li>
                  ))}
                </ul>
                {canEdit && (
                  <AddRow
                    label="Add"
                    onClick={() => commit({ [column.key]: [...column.items, ""] } as Partial<NoteBlock>)}
                  />
                )}
              </div>
            ))}
          </div>
          <SourceTag block={block} />
        </div>
      );
    }

    case "comparisonTable": {
      const headers = block.headers ?? [];
      const rows = block.rows ?? [];
      return (
        <div>
          <SectionTitle value={title} editable={canEdit} onCommit={(value) => commit({ title: value })} className="mb-3" />
          <div className="np-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr style={{ background: "var(--np-accent-soft)" }}>
                    {headers.map((header, index) => (
                      <th key={index} className="border-b px-4 py-3 font-semibold" style={{ borderColor: "var(--np-border)" }}>
                        <EditableText
                          as="span"
                          value={header}
                          editable={canEdit}
                          singleLine
                          placeholder="Column"
                          onCommit={(value) =>
                            commit({ headers: headers.map((entry, i) => (i === index ? value : entry)) })
                          }
                          className="text-[11px] uppercase tracking-[0.12em]"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b last:border-0" style={{ borderColor: "var(--np-border)" }}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={cn("px-4 py-3 align-top leading-6", cellIndex === 0 && "font-medium")}
                          style={{ color: cellIndex === 0 ? "var(--np-heading)" : "var(--np-fg)" }}
                        >
                          <EditableText
                            as="span"
                            value={cell}
                            editable={canEdit}
                            placeholder="—"
                            onCommit={(value) =>
                              commit({
                                rows: rows.map((entry, r) =>
                                  r === rowIndex ? entry.map((current, c) => (c === cellIndex ? value : current)) : entry,
                                ),
                              })
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {canEdit && (
            <AddRow
              label="Add row"
              onClick={() => commit({ rows: [...rows, headers.map(() => "")] })}
            />
          )}
          <SourceTag block={block} />
        </div>
      );
    }

    case "flowchart":
    case "tree":
      return (
        <div className="np-card p-5 sm:p-6">
          <div className="flex items-center gap-2" style={{ color: "var(--np-accent)" }}>
            <span className="np-mono text-xs">{block.type === "tree" ? "⌘" : "↦"}</span>
            <span className={EYEBROW}>{block.type === "tree" ? "Classification" : "Process"}</span>
          </div>
          <SectionTitle value={title} editable={canEdit} onCommit={(value) => commit({ title: value })} className="mt-2" />
          <div className="mt-4 flex justify-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full">
            <MermaidDiagram chart={block.mermaid ?? ""} dark={themeDark} />
          </div>
          {(text || canEdit) && (
            <EditableText
              as="p"
              value={text}
              editable={canEdit}
              placeholder="Optional caption"
              onCommit={(value) => commit({ text: value })}
              className="mt-3 text-center text-xs leading-6"
            />
          )}
          {canEdit && <DiagramSourceEditor value={block.mermaid ?? ""} onCommit={(mermaid) => commit({ mermaid })} />}
          <SourceTag block={block} />
        </div>
      );

    case "steps": {
      const steps = block.steps ?? [];
      return (
        <div className="np-card p-5 sm:p-6">
          <SectionTitle value={title} editable={canEdit} onCommit={(value) => commit({ title: value })} className="mb-5" />
          <ol className="relative space-y-5">
            <span aria-hidden className="absolute bottom-3 left-[15px] top-3 w-px" style={{ background: "var(--np-border-strong)" }} />
            {steps.map((step, index) => (
              <li key={index} className="group/item relative flex gap-4">
                <span
                  className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-semibold"
                  style={{
                    background: "var(--np-card)",
                    borderColor: "var(--np-border-strong)",
                    color: "var(--np-accent)",
                  }}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 pb-1">
                  <EditableText
                    as="p"
                    value={step.title}
                    editable={canEdit}
                    singleLine
                    placeholder="Step"
                    onCommit={(value) =>
                      commit({ steps: steps.map((entry, i) => (i === index ? { ...entry, title: value } : entry)) })
                    }
                    className="np-heading font-semibold"
                  />
                  <EditableText
                    as="p"
                    value={step.detail}
                    editable={canEdit}
                    placeholder="What happens here"
                    onCommit={(value) =>
                      commit({ steps: steps.map((entry, i) => (i === index ? { ...entry, detail: value } : entry)) })
                    }
                    className="mt-0.5 text-sm leading-6"
                  />
                </div>
                {canEdit && steps.length > 1 && (
                  <RemoveButton
                    label="Remove step"
                    onClick={() => commit({ steps: steps.filter((_, i) => i !== index) })}
                  />
                )}
              </li>
            ))}
          </ol>
          {canEdit && (
            <AddRow
              label="Add step"
              onClick={() => commit({ steps: [...steps, { title: "New step", detail: "" }] })}
            />
          )}
          <SourceTag block={block} />
        </div>
      );
    }

    case "code":
      return (
        <div>
          <SectionTitle value={title} editable={canEdit} onCommit={(value) => commit({ title: value })} className="mb-2.5" />
          {text && (
            <EditableText
              as="p"
              value={text}
              editable={canEdit}
              placeholder="Short explanation"
              onCommit={(value) => commit({ text: value })}
              className="mb-3 text-sm leading-6"
            />
          )}
          <CodeBlock
            code={block.code ?? ""}
            language={block.language}
            editable={canEdit}
            onCommit={(code) => commit({ code })}
            onLanguage={(language) => commit({ language })}
          />
          <SourceTag block={block} />
        </div>
      );

    case "solvedProblem": {
      const steps = block.steps ?? [];
      return (
        <div className="np-card overflow-hidden">
          <div className="border-b px-5 py-3 sm:px-6" style={{ borderColor: "var(--np-border)", background: "var(--np-accent-soft)" }}>
            <div className="flex items-center gap-2" style={{ color: "var(--np-accent)" }}>
              <span className="np-mono text-xs">ƒ(x)</span>
              <span className={EYEBROW}>Solved problem</span>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <SectionTitle value={title} editable={canEdit} onCommit={(value) => commit({ title: value })} className="mb-2" />
            <EditableText
              as="p"
              value={text}
              editable={canEdit}
              placeholder="State the problem…"
              onCommit={(value) => commit({ text: value })}
              className="rounded-xl border-l-2 px-4 py-3 text-[15px] italic leading-7"
            />
            <div className="mt-5 space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="group/item flex gap-3">
                  <span
                    className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
                    style={{ background: "var(--np-accent-soft)", color: "var(--np-accent)" }}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <EditableText
                      as="p"
                      value={step.title}
                      editable={canEdit}
                      singleLine
                      placeholder="Reasoning"
                      onCommit={(value) =>
                        commit({ steps: steps.map((entry, i) => (i === index ? { ...entry, title: value } : entry)) })
                      }
                      className="np-heading text-sm font-semibold"
                    />
                    <EditableText
                      as="p"
                      value={step.detail}
                      editable={canEdit}
                      placeholder="Show the working"
                      onCommit={(value) =>
                        commit({ steps: steps.map((entry, i) => (i === index ? { ...entry, detail: value } : entry)) })
                      }
                      className="mt-0.5 text-sm leading-6"
                    />
                  </div>
                  {canEdit && steps.length > 1 && (
                    <RemoveButton label="Remove step" onClick={() => commit({ steps: steps.filter((_, i) => i !== index) })} />
                  )}
                </div>
              ))}
            </div>
            {canEdit && (
              <AddRow label="Add step" onClick={() => commit({ steps: [...steps, { title: "Next step", detail: "" }] })} />
            )}
            <SourceTag block={block} />
          </div>
        </div>
      );
    }

    case "flashcards": {
      const pairs = block.pairs ?? [];
      return (
        <div>
          <div className="mb-3 flex items-center gap-2" style={{ color: "var(--np-accent-2)" }}>
            <span className="np-mono text-xs">⇄</span>
            <span className={EYEBROW}>Flashcards</span>
          </div>
          <SectionTitle value={title} editable={canEdit} onCommit={(value) => commit({ title: value })} className="mb-3" />
          <div className="grid gap-3 sm:grid-cols-2">
            {pairs.map((pair, index) => (
              <div key={index} className="np-soft group/item rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="np-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--np-muted)" }}>
                    Card {index + 1}
                  </span>
                  {canEdit && pairs.length > 1 && (
                    <RemoveButton label="Remove card" onClick={() => commit({ pairs: pairs.filter((_, i) => i !== index) })} />
                  )}
                </div>
                <EditableText
                  as="p"
                  value={pair.front}
                  editable={canEdit}
                  placeholder="Question"
                  onCommit={(value) =>
                    commit({ pairs: pairs.map((entry, i) => (i === index ? { ...entry, front: value } : entry)) })
                  }
                  className="np-heading mt-2 text-[15px] font-semibold leading-6"
                />
                <div className="my-2.5 h-px" style={{ background: "var(--np-border)" }} />
                <EditableText
                  as="p"
                  value={pair.back}
                  editable={canEdit}
                  placeholder="Answer"
                  onCommit={(value) =>
                    commit({ pairs: pairs.map((entry, i) => (i === index ? { ...entry, back: value } : entry)) })
                  }
                  className="text-sm leading-6"
                />
              </div>
            ))}
          </div>
          {canEdit && (
            <AddRow label="Add flashcard" onClick={() => commit({ pairs: [...pairs, { front: "", back: "" }] })} />
          )}
          <SourceTag block={block} />
        </div>
      );
    }

    case "glossary": {
      const terms = block.terms ?? [];
      return (
        <div className="np-soft rounded-2xl p-5 sm:p-6">
          <SectionTitle value={title} editable={canEdit} onCommit={(value) => commit({ title: value })} className="mb-4" />
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {terms.map((term, index) => (
              <div key={index} className="group/item min-w-0">
                <div className="flex items-start">
                  <EditableText
                    as="dt"
                    value={term.term}
                    editable={canEdit}
                    singleLine
                    placeholder="Term"
                    onCommit={(value) =>
                      commit({ terms: terms.map((entry, i) => (i === index ? { ...entry, term: value } : entry)) })
                    }
                    className="np-heading text-sm font-bold"
                  />
                  {canEdit && terms.length > 1 && (
                    <RemoveButton label="Remove term" onClick={() => commit({ terms: terms.filter((_, i) => i !== index) })} />
                  )}
                </div>
                <EditableText
                  as="dd"
                  value={term.definition}
                  editable={canEdit}
                  placeholder="Meaning"
                  onCommit={(value) =>
                    commit({ terms: terms.map((entry, i) => (i === index ? { ...entry, definition: value } : entry)) })
                  }
                  className="mt-1 text-sm leading-6"
                />
              </div>
            ))}
          </dl>
          {canEdit && (
            <AddRow label="Add term" onClick={() => commit({ terms: [...terms, { term: "", definition: "" }] })} />
          )}
          <SourceTag block={block} />
        </div>
      );
    }

    case "takeaways": {
      const items = block.items ?? [];
      return (
        <div
          className="relative overflow-hidden rounded-2xl border p-5 sm:p-6"
          style={{
            borderColor: "var(--np-border-strong)",
            background: "linear-gradient(135deg, var(--np-accent-soft), transparent 65%), var(--np-card)",
            boxShadow: "var(--np-shadow)",
          }}
        >
          <div className="flex items-center gap-2" style={{ color: "var(--np-accent)" }}>
            <Sparkles className="size-4" />
            <span className={EYEBROW}>Key takeaways</span>
          </div>
          <SectionTitle value={title} editable={canEdit} onCommit={(value) => commit({ title: value })} className="mt-2 mb-4" />
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={index} className="group/item flex items-start gap-3">
                <span className="np-mono mt-0.5 text-[11px] font-bold" style={{ color: "var(--np-accent)" }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <EditableText
                  as="span"
                  value={item}
                  editable={canEdit}
                  placeholder="Takeaway"
                  onCommit={(value) => commit({ items: items.map((entry, i) => (i === index ? value : entry)) })}
                  className="min-w-0 flex-1 text-[15px] leading-7"
                />
                {canEdit && items.length > 1 && (
                  <RemoveButton label="Remove takeaway" onClick={() => commit({ items: items.filter((_, i) => i !== index) })} />
                )}
              </li>
            ))}
          </ul>
          {canEdit && <AddRow label="Add takeaway" onClick={() => commit({ items: [...items, ""] })} />}
          <SourceTag block={block} />
        </div>
      );
    }

    case "quiz": {
      const pairs = block.pairs ?? [];
      return (
        <div className="np-card p-5 sm:p-6">
          <div className="flex items-center gap-2" style={{ color: "var(--np-accent-2)" }}>
            <GraduationCap className="size-4" />
            <span className={EYEBROW}>Quick quiz</span>
          </div>
          <SectionTitle value={title} editable={canEdit} onCommit={(value) => commit({ title: value })} className="mt-2 mb-3" />
          <div className="divide-y" style={{ borderColor: "var(--np-border)" }}>
            {pairs.map((pair, index) => (
              <div key={index} className="group/item py-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <span className="np-mono mt-0.5 text-[11px] font-bold" style={{ color: "var(--np-accent-2)" }}>
                    Q{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <EditableText
                      as="p"
                      value={pair.front}
                      editable={canEdit}
                      placeholder="Question"
                      onCommit={(value) =>
                        commit({ pairs: pairs.map((entry, i) => (i === index ? { ...entry, front: value } : entry)) })
                      }
                      className="np-heading text-[15px] font-semibold leading-6"
                    />
                    <details className="mt-2">
                      <summary
                        className="inline-flex cursor-pointer list-none items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
                        style={{ color: "var(--np-accent)" }}
                      >
                        Reveal answer
                      </summary>
                      <EditableText
                        as="p"
                        value={pair.back}
                        editable={canEdit}
                        placeholder="Answer"
                        onCommit={(value) =>
                          commit({ pairs: pairs.map((entry, i) => (i === index ? { ...entry, back: value } : entry)) })
                        }
                        className="mt-2 rounded-lg px-3 py-2 text-sm leading-6"
                      />
                    </details>
                  </div>
                  {canEdit && pairs.length > 1 && (
                    <RemoveButton label="Remove question" onClick={() => commit({ pairs: pairs.filter((_, i) => i !== index) })} />
                  )}
                </div>
              </div>
            ))}
          </div>
          {canEdit && (
            <AddRow label="Add question" onClick={() => commit({ pairs: [...pairs, { front: "", back: "" }] })} />
          )}
          <SourceTag block={block} />
        </div>
      );
    }

    default:
      return null;
  }
}
