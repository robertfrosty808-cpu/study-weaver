import { Logo, LogoMark } from "@/components/brand/Logo";
import { BlockView } from "@/components/notes/BlockView";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  BLOCK_LIBRARY,
  GEN_STEPS,
  NOTE_THEMES,
  themeById,
  type BlockType,
  type NoteBlock,
} from "@/lib/note-types";
import { cn } from "@/lib/utils";
import { useAction, useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cloud,
  Copy,
  Eye,
  GripVertical,
  Loader2,
  Menu,
  Palette,
  Pencil,
  Plus,
  Redo2,
  RotateCcw,
  Sparkles,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

type ProjectDoc = Doc<"noteProjects">;
type StoredBlock = ProjectDoc["blocks"][number];
type NoteThemeId = string;

const asNoteBlocks = (blocks: StoredBlock[] | undefined) =>
  (blocks ?? []) as unknown as NoteBlock[];
const asStoredBlocks = (blocks: NoteBlock[]) =>
  blocks as unknown as StoredBlock[];

/* ------------------------------------------------------------------ */
/* Generation                                                          */
/* ------------------------------------------------------------------ */

function useElapsed(startedAt: number, active: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function GenerationScreen({ project }: { project: ProjectDoc }) {
  const theme = themeById(project.theme);
  const blocks = asNoteBlocks(project.blocks);
  const elapsed = useElapsed(project.createdAt, project.status === "generating" || project.status === "queued");
  const previewRef = useRef<HTMLDivElement>(null);
  const stageIndex = GEN_STEPS.findIndex((step) => step.id === project.stage);
  const currentIndex = project.stage === "done" ? GEN_STEPS.length : Math.max(0, stageIndex);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [blocks.length]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:px-6">
          <Logo to="/dashboard" />
          <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            {project.status === "queued" ? "Starting up" : "Building your notes"}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1280px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:py-10">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-[0_1px_2px_rgb(20_22_40/0.04)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">EduNotes Pro</p>
            <h1 className="font-display mt-2 text-xl font-extrabold leading-tight tracking-tight">
              Building your study guide
            </h1>
            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {project.sourceLabel ? `From ${project.sourceLabel}` : project.topic}
            </p>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #3b55d9, #12968f)" }}
                initial={{ width: "3%" }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{project.stageDetail || "Working…"}</span>
              <span className="font-mono">{project.progress}%</span>
            </div>

            <ol className="mt-6 space-y-1">
              {GEN_STEPS.map((step, index) => {
                const complete = currentIndex > index || project.status === "ready";
                const active = currentIndex === index && project.status !== "ready";
                return (
                  <li key={step.id} className="flex gap-3 rounded-lg px-1.5 py-2">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
                      {complete ? (
                        <CheckCircle2 className="size-[18px] text-primary" />
                      ) : active ? (
                        <Loader2 className="size-[18px] animate-spin text-primary" />
                      ) : (
                        <span className="size-3.5 rounded-full border-2 border-muted-foreground/25" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          active ? "text-foreground" : complete ? "text-foreground/80" : "text-muted-foreground/60",
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground/70">{step.blurb}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Cloud className="size-3" /> Saved as it writes
              </span>
              <span className="font-mono">{elapsed}</span>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
            <p className="text-[11px] font-medium">Source accuracy</p>
            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
              {project.sourceMaterial
                ? "Content taken directly from your material is labeled “From your material” with a page or slide reference. Added teaching explanations are labeled “AI explanation” so you can tell them apart."
                : "Every section is tagged “AI explanation”. No page references are shown because this guide was built from your topic, not uploaded material."}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">
              Notes appear as they are written
            </p>
            <span className="rounded-full border border-border/80 bg-card px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {blocks.length} blocks
            </span>
          </div>

          <div
            ref={previewRef}
            className={cn(
              "note-canvas scrollbar-thin max-h-[74vh] overflow-y-auto rounded-[24px] border p-4 sm:p-7",
              theme.className,
            )}
            style={{ borderColor: "var(--np-border-strong)", boxShadow: "var(--np-shadow)" }}
          >
            <div className="flex flex-col gap-6">
              <AnimatePresence initial={false}>
                {blocks.map((block) => (
                  <motion.div
                    key={block.id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <BlockView block={block} themeDark={theme.dark} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {blocks.length === 0 && (
                <div className="rounded-2xl border border-dashed p-6" style={{ borderColor: "var(--np-border)" }}>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--np-accent)" }}>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Designing the outline…</span>
                  </div>
                  <div className="mt-5 space-y-2.5">
                    <div className="h-7 w-3/4 rounded-lg" style={{ background: "var(--np-border)" }} />
                    <div className="h-3 w-full animate-pulse rounded" style={{ background: "var(--np-border)" }} />
                    <div className="h-3 w-5/6 animate-pulse rounded" style={{ background: "var(--np-border)" }} />
                    <div className="mt-5 h-24 w-full animate-pulse rounded-xl" style={{ background: "var(--np-card)" }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="mt-3 text-center text-[10px] text-muted-foreground/70">
            Keep this tab open. Your guide is saved automatically as each chapter is finished.
          </p>
        </div>
      </main>
    </div>
  );
}

function FailureScreen({
  project,
  onRetry,
  retrying,
}: {
  project: ProjectDoc;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Logo to="/dashboard" />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-1.5 size-3.5" /> Dashboard
            </Link>
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </div>
                    <h1 className="font-display mt-4 text-2xl font-extrabold tracking-tight">Your notes paused mid-build</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {project.error || "Something went wrong while writing this study guide."}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-muted-foreground/70">
          Your request and settings are saved. Try again — the pipeline restarts from the understanding step.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button onClick={onRetry} disabled={retrying}>
            {retrying ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RotateCcw className="mr-2 size-4" />}
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

const PREFS_KEY = "edunotes:notes-prefs";

function loadPrefs(): { typeface: "sans" | "serif"; width: "focused" | "wide" } {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<{ typeface: string; width: string }>;
      return {
        typeface: parsed.typeface === "serif" ? "serif" : "sans",
        width: parsed.width === "wide" ? "wide" : "focused",
      };
    }
  } catch {
    // ignore malformed prefs
  }
  return { typeface: "sans", width: "focused" };
}

function SaveBadge({ state }: { state: "saved" | "saving" | "error" }) {
  if (state === "saving") {
    return (
      <span className="hidden items-center gap-1.5 text-[10px] font-medium text-muted-foreground sm:flex">
        <Loader2 className="size-3 animate-spin" /> Saving
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="hidden items-center gap-1.5 text-[10px] font-medium text-destructive sm:flex">
        <AlertTriangle className="size-3" /> Not saved
      </span>
    );
  }
  return (
    <span className="hidden items-center gap-1.5 text-[10px] font-medium text-muted-foreground sm:flex">
      <Check className="size-3" /> Saved
    </span>
  );
}

function Contents({
  blocks,
  active,
  onNavigate,
}: {
  blocks: NoteBlock[];
  active: number;
  onNavigate: (blockId: string) => void;
}) {
  const sections = blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.type === "hero" || block.type === "chapterHeader");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Contents</p>
        <span className="font-mono text-[10px] text-muted-foreground/60">{sections.length}</span>
      </div>
      <nav className="mt-3 space-y-0.5" aria-label="Table of contents">
        {sections.map(({ block }, index) => {
          const isHero = block.type === "hero";
          return (
            <button
              key={block.id}
              type="button"
              onClick={() => onNavigate(block.id)}
              className={cn(
                "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] leading-5 transition-colors",
                active === index
                  ? "bg-primary/8 font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 shrink-0 font-mono text-[9px]",
                  active === index ? "text-primary" : "text-muted-foreground/60",
                )}
              >
                {isHero ? "—" : block.badge || String(index).padStart(2, "0")}
              </span>
              <span className="line-clamp-2">{isHero ? "Overview" : block.title}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-border/70 pt-4">
        <p className="text-[10px] leading-5 text-muted-foreground/70">
          Edit any line on the canvas. Select a block to drag, duplicate or restyle it.
        </p>
      </div>
    </div>
  );
}

function NotesEditor({ project }: { project: ProjectDoc }) {
  const projectId = project._id;
  const navigate = useNavigate();
  const updateBlocks = useMutation(api.notes.updateBlocks);
  const updateTheme = useMutation(api.notes.updateTheme);
  const rename = useMutation(api.notes.rename);

  const initialBlocks = useMemo(() => asNoteBlocks(project.blocks), [project.blocks]);
  const [blocks, setBlocks] = useState<NoteBlock[]>(initialBlocks);
  const [title, setTitle] = useState(project.title);
  const [theme, setTheme] = useState<NoteThemeId>(project.theme);
  const [prefs, setPrefs] = useState(loadPrefs);
  const [editing, setEditing] = useState(true);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [activeToc, setActiveToc] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [, setHistoryTick] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [warningsDismissed, setWarningsDismissed] = useState(false);

  const historyRef = useRef<NoteBlock[][]>([initialBlocks]);
  const historyIndexRef = useRef(0);
  const saveTimerRef = useRef<number | null>(null);
  const latestRef = useRef<NoteBlock[]>(initialBlocks);

  const themeMeta = themeById(theme);
  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  useEffect(() => {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const persist = useCallback(
    async (next: NoteBlock[]) => {
      setSaveState("saving");
      try {
        await updateBlocks({ id: projectId, blocks: asStoredBlocks(next) });
        setSaveState("saved");
      } catch {
        setSaveState("error");
        toast.error("Your latest edit could not be saved.");
      }
    },
    [projectId, updateBlocks],
  );

  const scheduleSave = useCallback(
    (next: NoteBlock[]) => {
      latestRef.current = next;
      setSaveState("saving");
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => {
        void persist(next);
      }, 750);
    },
    [persist],
  );

  const pushHistory = (snapshot: NoteBlock[]) => {
    const stack = historyRef.current.slice(0, historyIndexRef.current + 1);
    stack.push(snapshot);
    if (stack.length > 80) stack.shift();
    historyRef.current = stack;
    historyIndexRef.current = stack.length - 1;
    setHistoryTick((value) => value + 1);
  };

  const commit = (next: NoteBlock[], record = true) => {
    if (record) pushHistory(blocks);
    setBlocks(next);
    scheduleSave(next);
  };

  const updateBlock = (index: number, patch: Partial<NoteBlock>) => {
    commit(blocks.map((block, i) => (i === index ? { ...block, ...patch } : block)));
  };

  const insertBlock = (type: BlockType, at: number) => {
    const block = makeLocalBlock(type);
    const next = [...blocks];
    next.splice(at, 0, block);
    commit(next);
  };

  const duplicateBlock = (index: number) => {
    const clone = JSON.parse(JSON.stringify(blocks[index])) as NoteBlock;
    clone.id = `copy-${Math.random().toString(36).slice(2, 8)}`;
    const next = [...blocks];
    next.splice(index + 1, 0, clone);
    commit(next);
  };

  const deleteBlock = (index: number) => {
    commit(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (from: number, to: number) => {
    if (from === to) return;
    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    commit(next);
  };

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const next = historyRef.current[historyIndexRef.current];
    setBlocks(next);
    scheduleSave(next);
    setHistoryTick((value) => value + 1);
  }, [scheduleSave]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const next = historyRef.current[historyIndexRef.current];
    setBlocks(next);
    scheduleSave(next);
    setHistoryTick((value) => value + 1);
  }, [scheduleSave]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;
      const active = document.activeElement as HTMLElement | null;
      if (active?.isContentEditable || active?.tagName === "INPUT" || active?.tagName === "TEXTAREA") return;
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    const onScroll = () => {
      let current = 0;
      const sections = blocks.filter((block) => block.type === "hero" || block.type === "chapterHeader");
      sections.forEach((block, index) => {
        const el = document.getElementById(`block-${block.id}`);
        if (el && el.getBoundingClientRect().top < 180) current = index;
      });
      setActiveToc(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [blocks]);

  useEffect(() => {
    return () => {
      // Flush a pending debounce so a quick navigation never loses the last edit.
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        void persist(latestRef.current);
      }
    };
  }, [persist]);

  const navigateTo = (blockId: string) => {
    setTocOpen(false);
    document.getElementById(`block-${blockId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chooseTheme = (nextTheme: string) => {
    setTheme(nextTheme);
    void updateTheme({ id: projectId, theme: nextTheme }).catch(() => toast.error("Could not save the theme change."));
  };

  const toc = <Contents blocks={blocks} active={activeToc} onNavigate={navigateTo} />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-1.5 px-2.5 sm:gap-2 sm:px-4">
          <Button variant="ghost" size="icon" className="size-8" aria-label="Back to dashboard" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="size-4" />
          </Button>
          <Link to="/dashboard" className="hidden sm:block" aria-label="EduNotes Pro dashboard">
            <LogoMark />
          </Link>
          <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
          <div className="min-w-0 flex-1">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={() => {
                const clean = title.trim();
                if (clean && clean !== project.title) {
                  void rename({ id: projectId, title: clean }).catch(() => toast.error("Could not rename this guide."));
                }
              }}
              aria-label="Study guide title"
              className="w-full max-w-[240px] truncate rounded-md border-0 bg-transparent px-1 py-1 font-display text-[13px] font-bold tracking-tight outline-none transition-colors hover:bg-muted/60 focus:bg-muted/60 sm:max-w-[320px] sm:text-sm"
            />
            <div className="px-1">
              <SaveBadge state={saveState} />
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button variant="ghost" size="icon" className="hidden size-8 sm:flex" aria-label="Undo" onClick={undo} disabled={!canUndo}>
              <Undo2 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden size-8 sm:flex" aria-label="Redo" onClick={redo} disabled={!canRedo}>
              <Redo2 className="size-4" />
            </Button>
            <div className="mx-0.5 hidden h-6 w-px bg-border sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg px-2 text-xs">
                  <Plus className="size-3.5" />
                  <span className="hidden md:inline">Insert</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-[70vh] w-60 overflow-y-auto">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Add a block
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {BLOCK_LIBRARY.map((item) => (
                  <DropdownMenuItem key={item.type} onClick={() => insertBlock(item.type, blocks.length)}>
                    <div>
                      <p className="text-xs font-medium">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg px-2 text-xs">
                  <Palette className="size-3.5" />
                  <span className="hidden md:inline">{themeMeta.name}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[310px] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Notes theme</p>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {NOTE_THEMES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => chooseTheme(item.id)}
                      className={cn(
                        "rounded-xl border p-1.5 text-left transition-colors",
                        theme === item.id ? "border-primary bg-primary/5" : "border-border hover:border-border/80 hover:bg-muted/50",
                      )}
                    >
                      <span
                        className="block h-10 rounded-lg border border-black/5"
                        style={{ background: `linear-gradient(135deg, ${item.swatch[0]} 0%, ${item.swatch[1]} 60%, ${item.swatch[2]} 100%)` }}
                      />
                      <span className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold">
                        {item.name}
                        {theme === item.id && <Check className="size-3 text-primary" />}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="my-4 h-px bg-border" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Headings</p>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {(["sans", "serif"] as const).map((typeface) => (
                    <button
                      key={typeface}
                      type="button"
                      onClick={() => setPrefs((prev) => ({ ...prev, typeface }))}
                      className={cn(
                        "rounded-lg border px-2 py-2 text-[11px] font-medium capitalize transition-colors",
                        prefs.typeface === typeface ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                      )}
                      style={typeface === "serif" ? { fontFamily: "Georgia, serif" } : undefined}
                    >
                      {typeface === "sans" ? "Modern sans" : "Editorial"}
                    </button>
                  ))}
                </div>

                <div className="my-4 h-px bg-border" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Page width</p>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {(["focused", "wide"] as const).map((width) => (
                    <button
                      key={width}
                      type="button"
                      onClick={() => setPrefs((prev) => ({ ...prev, width }))}
                      className={cn(
                        "rounded-lg border px-2 py-2 text-[11px] font-medium capitalize transition-colors",
                        prefs.width === width ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {width}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant={editing ? "default" : "outline"}
              size="sm"
              className="h-8 gap-1.5 rounded-lg px-2 text-xs"
              onClick={() => setEditing((value) => !value)}
              aria-pressed={editing}
            >
              {editing ? <Eye className="size-3.5" /> : <Pencil className="size-3.5" />}
              <span className="hidden md:inline">{editing ? "Preview" : "Edit"}</span>
            </Button>

            <Sheet open={tocOpen} onOpenChange={setTocOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 xl:hidden" aria-label="Open contents">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-5">
                <SheetTitle className="sr-only">Contents</SheetTitle>
                {toc}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {project.status === "error" && (
        <div className="border-b border-destructive/20 bg-destructive/5 px-4 py-2 text-center text-[11px] text-destructive">
          The final generation step hit a problem. Your saved notes are intact — {project.error}
        </div>
      )}

      {!warningsDismissed && (project.warnings?.length ?? 0) > 0 && (
        <div className="border-b border-[#d9a23a]/25 bg-[#f2bf5e]/10">
          <div className="mx-auto flex max-w-[1180px] items-start gap-3 px-4 py-2.5 sm:px-6">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#a8730f]" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-foreground">Before you study this set</p>
              <ul className="mt-0.5 space-y-0.5">
                {project.warnings?.map((warning) => (
                  <li key={warning} className="text-[10px] leading-5 text-muted-foreground">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setWarningsDismissed(true)}
              aria-label="Dismiss warnings"
              className="rounded p-1 text-muted-foreground hover:bg-black/5 hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-[1500px] items-start">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[236px] shrink-0 overflow-y-auto border-r border-border/60 p-5 xl:block">
          {toc}
        </aside>

        <main className="min-w-0 flex-1 px-2.5 py-5 sm:px-6 sm:py-8 lg:px-10">
          <div
            className={cn(
              "mx-auto w-full transition-[max-width] duration-300",
              prefs.width === "focused" ? "max-w-[860px]" : "max-w-[1120px]",
            )}
          >
            <div
              className={cn(
                "note-canvas rounded-[24px] border p-4 sm:p-8 lg:p-10",
                themeMeta.className,
                prefs.typeface === "serif" && "note-type-serif",
              )}
              style={{ borderColor: "var(--np-border-strong)", boxShadow: "var(--np-shadow)" }}
            >
              <div className="flex flex-col gap-7">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    id={`block-${block.id}`}
                    className="group relative scroll-mt-24"
                    onDragOver={(event) => {
                      if (dragIndex === null) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDragOver(index);
                    }}
                    onDragLeave={() => setDragOver((current) => (current === index ? null : current))}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (dragIndex !== null && dragIndex !== index) moveBlock(dragIndex, index);
                      setDragIndex(null);
                      setDragOver(null);
                    }}
                    style={
                      dragOver === index
                        ? { boxShadow: "inset 0 3px 0 0 var(--np-accent)" }
                        : undefined
                    }
                  >
                    {editing && (
                      <div className="absolute -top-3 right-0 z-20 flex items-center gap-0.5 rounded-lg border border-border bg-popover p-0.5 text-foreground opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                        <span
                          draggable
                          onDragStart={(event) => {
                            setDragIndex(index);
                            event.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={() => {
                            setDragIndex(null);
                            setDragOver(null);
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label="Drag to reorder block"
                          title="Drag to reorder"
                          className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
                        >
                          <GripVertical className="size-3.5" />
                        </span>
                        <BlockInsertMenu onInsert={(type) => insertBlock(type, index + 1)} />
                        <EditorIcon
                          label="Move block up"
                          disabled={index === 0}
                          onClick={() => moveBlock(index, index - 1)}
                        >
                          <ChevronUp className="size-3.5" />
                        </EditorIcon>
                        <EditorIcon
                          label="Move block down"
                          disabled={index === blocks.length - 1}
                          onClick={() => moveBlock(index, index + 1)}
                        >
                          <ChevronDown className="size-3.5" />
                        </EditorIcon>
                        <EditorIcon label="Duplicate block" onClick={() => duplicateBlock(index)}>
                          <Copy className="size-3.5" />
                        </EditorIcon>
                        <EditorIcon label="Delete block" onClick={() => deleteBlock(index)} danger>
                          <Trash2 className="size-3.5" />
                        </EditorIcon>
                      </div>
                    )}

                    <BlockView
                      block={block}
                      editable={editing}
                      themeDark={themeMeta.dark}
                      onChange={(patch) => updateBlock(index, patch)}
                    />
                  </div>
                ))}
              </div>

              {editing && (
                <div className="mt-8 flex justify-center">
                  <BlockInsertMenu
                    align="center"
                    trigger={
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1.5 text-[11px] font-medium opacity-60 transition hover:opacity-100"
                        style={{ borderColor: "var(--np-border-strong)", color: "var(--np-muted)" }}
                      >
                        <Plus className="size-3" /> Add a block
                      </button>
                    }
                    onInsert={(type) => insertBlock(type, blocks.length)}
                  />
                </div>
              )}

              <footer
                className="mt-10 flex flex-col items-center justify-between gap-2 border-t pt-5 text-[10px] sm:flex-row"
                style={{ borderColor: "var(--np-border)", color: "var(--np-muted)" }}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-3" /> Made with EduNotes Pro
                </span>
                <span className="flex flex-wrap items-center gap-3 opacity-70">
                  {project.sourceMaterial && (
                    <span className="max-w-[280px] truncate">
                      Source: {project.sourceLabel || "Your material"}
                    </span>
                  )}
                  <span>Verify important facts before relying on them.</span>
                </span>
              </footer>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-muted-foreground">
              <span>{blocks.length} blocks · {blocks.filter((block) => block.type === "chapterHeader").length} chapters</span>
              <span className="flex items-center gap-1.5">
                <Cloud className="size-3" /> Changes save automatically
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function EditorIcon({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
        danger && "hover:bg-destructive/10 hover:text-destructive",
      )}
    >
      {children}
    </button>
  );
}

function BlockInsertMenu({
  onInsert,
  align = "end",
  trigger,
}: {
  onInsert: (type: BlockType) => void;
  align?: "start" | "center" | "end";
  trigger?: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            aria-label="Insert block below"
            title="Insert block below"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="size-3.5" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="max-h-[65vh] w-56 overflow-y-auto">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Insert block
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {BLOCK_LIBRARY.map((item) => (
          <DropdownMenuItem key={item.type} onClick={() => onInsert(item.type)}>
            <div>
              <p className="text-xs font-medium">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.description}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function makeLocalBlock(type: BlockType): NoteBlock {
  const id = `blk-${Math.random().toString(36).slice(2, 10)}`;
  switch (type) {
    case "hero":
      return { id, type, badge: "Study notes", title: "New guide", subtitle: "Add a subtitle", source: "ai" };
    case "chapterHeader":
      return { id, type, badge: "01", title: "New chapter", text: "What this chapter establishes." };
    case "paragraph":
      return { id, type, text: "Write a clear, detailed explanation here." };
    case "bulletList":
      return { id, type, title: "Key points", items: ["First point", "Second point"] };
    case "definition":
      return { id, type, title: "Term", text: "Define it precisely." };
    case "formula":
      return { id, type, title: "Formula", formula: "a^2 + b^2 = c^2", text: "Explain each symbol." };
    case "example":
      return { id, type, title: "Example", text: "Describe a concrete situation." };
    case "callout":
      return { id, type, tone: "important", title: "Important", text: "The idea worth remembering." };
    case "prosCons":
      return { id, type, title: "Advantages & disadvantages", pros: ["Advantage"], cons: ["Disadvantage"] };
    case "comparisonTable":
      return { id, type, title: "Comparison", headers: ["Aspect", "A", "B"], rows: [["Definition", "", ""]] };
    case "flowchart":
      return { id, type, title: "Process", mermaid: "flowchart LR\n  A[Start] --> B[Finish]" };
    case "steps":
      return { id, type, title: "Step by step", steps: [{ title: "First step", detail: "Explain it." }] };
    case "tree":
      return { id, type, title: "Classification", mermaid: "flowchart TD\n  A[Parent] --> B[Child]" };
    case "code":
      return { id, type, title: "Code", language: "python", code: "print('Hello')" };
    case "solvedProblem":
      return { id, type, title: "Solved problem", text: "State the problem.", steps: [{ title: "Reasoning", detail: "Show the working." }] };
    case "flashcards":
      return { id, type, title: "Flashcards", pairs: [{ front: "Question", back: "Answer" }] };
    case "glossary":
      return { id, type, title: "Key terms", terms: [{ term: "Term", definition: "Meaning" }] };
    case "takeaways":
      return { id, type, title: "Key takeaways", items: ["The one thing to remember"] };
    case "quiz":
      return { id, type, title: "Quick quiz", pairs: [{ front: "Question?", back: "Answer." }] };
    default:
      return { id, type: "paragraph", text: "" };
  }
}

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

export default function NotesStudio() {
  const { id } = useParams<{ id: string }>();
  const projectId = id as Id<"noteProjects"> | undefined;
  const project = useQuery(api.notes.get, projectId ? { id: projectId } : "skip");
  const generate = useAction(api.generate.generate);
  const startedRef = useRef<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const navigate = useNavigate();

  const start = useCallback(
    async (target: Id<"noteProjects">) => {
      try {
        const result = await generate({ id: target });
        if (result && typeof result === "object" && "ok" in result && !(result as { ok: boolean }).ok) {
          toast.error((result as { error?: string }).error || "Generation could not finish.");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Generation could not start.");
      }
    },
    [generate],
  );

  useEffect(() => {
    if (!project || project.status !== "queued") return;
    if (startedRef.current === project._id) return;
    startedRef.current = project._id;
    void start(project._id);
  }, [project, start]);

  const retry = async () => {
    if (!projectId) return;
    setRetrying(true);
    await start(projectId);
    setRetrying(false);
  };

  if (project === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-10 w-2/3 animate-pulse rounded-lg bg-muted" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-muted/70" />
          <div className="mt-8 h-[420px] animate-pulse rounded-2xl border border-border/60 bg-card" />
        </div>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-sm text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <ArrowUpRight className="size-5" />
          </div>
          <h1 className="font-display mt-4 text-xl font-bold">Notes not found</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">It may have been deleted, or it belongs to another account.</p>
          <Button className="mt-5" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (project.status === "error" && project.blocks.length === 0) {
    return <FailureScreen project={project} onRetry={retry} retrying={retrying} />;
  }

  if (project.status === "queued" || project.status === "generating") {
    return <GenerationScreen project={project} />;
  }

  return <NotesEditor key={project._id} project={project} />;
}
