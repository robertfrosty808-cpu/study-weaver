import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import {
  AUDIENCES,
  DEFAULT_SETTINGS,
  DETAIL_LEVELS,
  LANGUAGES,
  NOTE_THEMES,
  type DetailLevel,
  type NoteSettings,
} from "@/lib/note-types";
import { SAMPLE_NOTES } from "@/lib/sample-notes";
import {
  MAX_MATERIAL_CHARS,
  deriveTitleFromMaterial,
  extractMaterialFile,
  fileExtension,
  formatBytes,
  isSupportedMaterialFile,
} from "@/lib/extract-material";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  FileText,
  FileUp,
  GraduationCap,
  Layers,
  Lightbulb,
  Loader2,
  MoreHorizontal,
  Palette,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UploadCloud,
  Wand2,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Gradient descent",
  "The Krebs cycle",
  "Bayesian statistics",
  "SQL joins",
  "Cognitive biases",
  "The Cold War",
];

const STAGE_LABEL: Record<string, string> = {
  reading: "Reading",
  understanding: "Understanding",
  structuring: "Structuring",
  writing: "Writing",
  designing: "Designing",
  done: "Ready",
  error: "Needs attention",
};

interface MaterialUpload {
  id: string;
  name: string;
  size: number;
  status: "reading" | "done" | "error";
  pages?: number;
  warning?: string;
  error?: string;
  text?: string;
}

function ProjectCard({
  project,
  onDelete,
}: {
  project: {
    _id: string;
    title: string;
    subtitle?: string;
    status: string;
    stage: string;
    progress: number;
    theme: string;
    blockCount: number;
    updatedAt: number;
    subject?: string;
    hasSource?: boolean;
    sourceLabel?: string;
  };
  onDelete: (id: string, title: string) => void;
}) {
  const navigate = useNavigate();
  const theme = NOTE_THEMES.find((item) => item.id === project.theme) ?? NOTE_THEMES[0];
  const isReady = project.status === "ready";
  const isError = project.status === "error";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.28 }}
      className="group relative rounded-2xl border border-border/70 bg-card p-3 shadow-[0_1px_2px_rgb(20_22_40/0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_40px_-24px_rgb(20_22_40/0.28)]"
    >
      <div className={cn("note-canvas relative h-[116px] overflow-hidden rounded-xl border", theme.className)} style={{ borderColor: "var(--np-border)" }}>
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--np-accent)" }}>
            <Sparkles className="size-2.5" />
            {project.subject || theme.name}
          </div>
          <p className="np-heading mt-2 line-clamp-2 pr-6 font-display text-[13px] font-bold leading-tight" style={{ color: "var(--np-heading)" }}>
            {project.title}
          </p>
          <div className="mt-2.5 space-y-1.5">
            <div className="h-1 rounded-full" style={{ width: "86%", background: "var(--np-border-strong)" }} />
            <div className="h-1 rounded-full" style={{ width: "64%", background: "var(--np-border)" }} />
          </div>
        </div>
        {project.hasSource && (
          <span
            className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-[0.12em]"
            style={{ borderColor: "var(--np-border)", background: "var(--np-card)", color: "var(--np-accent)" }}
          >
            <FileUp className="size-2" /> Your material
          </span>
        )}
        {!isReady && (
          <div className="absolute inset-x-0 bottom-0 border-t px-3 py-1.5" style={{ borderColor: "var(--np-border)", background: "color-mix(in oklab, var(--np-bg) 80%, transparent)" }}>
            <p className="flex items-center gap-1.5 text-[9px] font-medium" style={{ color: isError ? "#e2715f" : "var(--np-accent)" }}>
              {!isError && <span className="size-1.5 animate-pulse rounded-full bg-current" />}
              {isError ? "Generation stopped" : `${STAGE_LABEL[project.stage] ?? "Working"} · ${project.progress}%`}
            </p>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1.5 top-1.5 size-7 opacity-70 transition-opacity hover:opacity-100"
              style={{ color: "var(--np-muted)" }}
              aria-label={`Actions for ${project.title}`}
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/notes/${project._id}`)}>
              <FileText className="mr-2 size-4" />
              Open notes
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(project._id, project.title)}>
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <button type="button" onClick={() => navigate(`/notes/${project._id}`)} className="mt-3 block w-full text-left">
        <p className="line-clamp-1 text-[13px] font-semibold">{project.title}</p>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
          {project.subtitle || (isReady ? `${project.blockCount} blocks · ${theme.name}` : "Being written right now")}
        </p>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground/80">
          <Clock className="size-3" />
          {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
          <span className="ml-auto flex items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Open <ArrowRight className="size-3" />
          </span>
        </div>
      </button>
    </motion.article>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const projects = useQuery(api.notes.list);
  const createProject = useMutation(api.notes.create);
  const createSample = useMutation(api.notes.createSample);
  const removeProject = useMutation(api.notes.remove);

  const [mode, setMode] = useState<"topic" | "material">("topic");
  const [topic, setTopic] = useState("");
  const [materialText, setMaterialText] = useState("");
  const [materialTitle, setMaterialTitle] = useState("");
  const [uploads, setUploads] = useState<MaterialUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [settings, setSettings] = useState<NoteSettings>(DEFAULT_SETTINGS);
  const [theme, setTheme] = useState("midnight");
  const [search, setSearch] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sampleBusy, setSampleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelledUploadsRef = useRef<Set<string>>(new Set());

  const firstName = user?.name?.split(" ")[0];
  const filtered = useMemo(() => {
    if (!projects) return [];
    const query = search.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter((project) =>
      `${project.title} ${project.subtitle ?? ""} ${project.subject ?? ""}`.toLowerCase().includes(query),
    );
  }, [projects, search]);

  const completedUploads = uploads.filter((upload) => upload.status === "done");
  const totalPages = completedUploads.reduce((total, upload) => total + (upload.pages ?? 0), 0);
  const materialWords = materialText.trim() ? materialText.trim().split(/\s+/).length : 0;
  const materialLimitReached = materialText.length >= MAX_MATERIAL_CHARS;
  const isExtracting = uploads.some((upload) => upload.status === "reading");

  const appendMaterial = (name: string, text: string) => {
    setMaterialText((previous) => {
      const header = `### ${name}\n`;
      const base = previous.trim();
      const combined = base ? `${base}\n\n${header}${text}` : `${header}${text}`;
      return combined.slice(0, MAX_MATERIAL_CHARS);
    });
  };

  const handleFiles = async (incoming: FileList | File[]) => {
    const files = Array.from(incoming);
    if (!files.length) return;
    if (uploads.length >= 8) {
      setError("You can attach up to 8 files. Paste the rest into the material box.");
      return;
    }

    const batch = files.slice(0, 8 - uploads.length);
    const nextItems: MaterialUpload[] = batch.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size,
      status: isSupportedMaterialFile(file) ? "reading" : "error",
      error: isSupportedMaterialFile(file)
        ? undefined
        : "Unsupported format. Use PDF, PowerPoint, Markdown or plain text.",
    }));

    setUploads((previous) => [...previous, ...nextItems]);

    for (let index = 0; index < batch.length; index += 1) {
      const file = batch[index];
      const item = nextItems[index];
      if (item.status === "error") continue;

      try {
        const result = await extractMaterialFile(file);
        if (cancelledUploadsRef.current.has(item.id)) continue;
        setUploads((previous) =>
          previous.map((entry) =>
            entry.id === item.id
              ? { ...entry, status: "done", text: result.text, pages: result.pages, warning: result.warning }
              : entry,
          ),
        );
        appendMaterial(file.name, result.text);
        if (result.warning) toast.warning(result.warning);
      } catch (extractionError) {
        const message = extractionError instanceof Error ? extractionError.message : "This file could not be read.";
        setUploads((previous) =>
          previous.map((entry) => (entry.id === item.id ? { ...entry, status: "error", error: message } : entry)),
        );
        toast.error(message);
      }
    }
  };

  const removeUpload = (upload: MaterialUpload) => {
    cancelledUploadsRef.current.add(upload.id);
    setUploads((previous) => previous.filter((entry) => entry.id !== upload.id));
    if (upload.text) {
      const block = `### ${upload.name}\n${upload.text}`;
      setMaterialText((previous) => previous.replace(block, "").replace(/\n{3,}/g, "\n\n").trim());
    }
  };

  const forge = async () => {
    setError(null);

    let resolvedTopic = topic.trim();
    let sourceMaterial: string | undefined;
    let sourceLabel: string | undefined;

    if (mode === "material") {
      if (isExtracting) {
        setError("Give the files a moment to finish reading, then create your notes.");
        return;
      }
      const material = materialText.trim();
      if (material.length < 150) {
        setError("Add a little more material — at least a short paragraph — so the notes have something to teach from.");
        return;
      }
      sourceMaterial = material.slice(0, MAX_MATERIAL_CHARS);
      sourceLabel = completedUploads.length
        ? completedUploads.map((upload) => upload.name).join(", ").slice(0, 160)
        : "your pasted material";
      resolvedTopic =
        materialTitle.trim() ||
        deriveTitleFromMaterial(sourceMaterial, completedUploads.map((upload) => upload.name));
    } else if (resolvedTopic.length < 3) {
      setError("Give your topic a little more detail — at least a few words.");
      return;
    }

    setBusy(true);
    try {
      const id = await createProject({
        topic: resolvedTopic,
        settings,
        theme,
        sourceMaterial,
        sourceLabel,
      });
      navigate(`/notes/${id}`);
    } catch (err) {
      setBusy(false);
      const message = err instanceof Error ? err.message : "Could not start generation.";
      setError(message);
      toast.error(message);
    }
  };

  const loadSample = async () => {
    setSampleBusy(true);
    try {
      const id = await createSample({
        title: "Neural Networks",
        subtitle: "How machines learn to recognize patterns, in plain language and real depth.",
        subject: "Machine learning",
        blocks: SAMPLE_NOTES,
        theme,
        settings,
      });
      navigate(`/notes/${id}`);
    } catch (err) {
      setSampleBusy(false);
      toast.error(err instanceof Error ? err.message : "Could not open the example.");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    try {
      await removeProject({ id: id as never });
      toast.success("Notes deleted");
    } catch {
      toast.error("Could not delete those notes.");
    }
  };

  return (
    <AppShell>
      <TooltipProvider delayDuration={300}>
        <div className="mx-auto w-full max-w-[1180px] px-5 pb-20 pt-8 sm:px-8 sm:pt-10">
          <header className="relative">
            <div aria-hidden className="pointer-events-none absolute -left-16 -top-24 size-56 rounded-full bg-primary/10 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute right-10 top-0 size-32 rounded-full bg-[#0e9488]/10 blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Your workspace
                </div>
                <h1 className="font-display mt-2 max-w-2xl text-3xl font-extrabold leading-[1.08] tracking-[-0.035em] sm:text-[40px]">
                  Create <span className="brand-gradient-text">exceptional notes</span> from anything you’re studying.
                </h1>
                <p className="mt-2.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {firstName ? `Welcome back, ${firstName}. ` : ""}
                  Start with a topic, upload your lecture slides, or paste your reading. EduNotes Pro reads it, teaches it back, and hands you a workspace to make it your own.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm">
                <BookOpen className="size-4 text-primary" />
                <span className="font-semibold text-foreground">{projects?.length ?? 0}</span> note sets
              </div>
            </div>
          </header>

          {/* Composer */}
          <section id="compose" className="mt-7 scroll-mt-24">
            <div className="relative overflow-hidden rounded-[22px] border border-border/80 bg-card shadow-[0_2px_4px_rgb(20_22_40/0.03),0_24px_60px_-40px_rgb(20_22_40/0.35)]">
              <div className="brand-gradient absolute inset-x-0 top-0 h-[3px]" />
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                      <Wand2 className="size-4" />
                    </span>
                    New note set
                  </div>
                  <div className="flex rounded-lg border border-border/80 bg-muted/60 p-1" role="tablist" aria-label="Input type">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mode === "topic"}
                      onClick={() => {
                        setMode("topic");
                        setError(null);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors",
                        mode === "topic" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Sparkles className="size-3" /> Start with a topic
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mode === "material"}
                      onClick={() => {
                        setMode("material");
                        setError(null);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors",
                        mode === "material" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <FileUp className="size-3" /> Upload my material
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {mode === "topic" ? (
                    <motion.div
                      key="topic"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-xs font-medium text-muted-foreground">What do you want to learn?</p>
                        <div className="hidden items-center gap-1.5 text-[10px] text-muted-foreground sm:flex">
                          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px]">⌘</kbd>
                          <span>+</span>
                          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px]">↵</kbd>
                          <span>to create</span>
                        </div>
                      </div>
                      <Textarea
                        value={topic}
                        onChange={(event) => {
                          setTopic(event.target.value);
                          if (error) setError(null);
                        }}
                        onKeyDown={(event) => {
                          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                            event.preventDefault();
                            void forge();
                          }
                        }}
                        placeholder="e.g. How neural networks learn, the French Revolution, or organic chemistry reaction mechanisms…"
                        aria-label="Topic for your study notes"
                        rows={3}
                        maxLength={400}
                        className="mt-2 min-h-[92px] resize-none border-0 bg-transparent px-0 text-[16px] leading-7 shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0 dark:bg-transparent sm:text-[17px]"
                      />

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              setTopic(suggestion);
                              setError(null);
                            }}
                            className="rounded-full border border-border/80 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="material"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4"
                    >
                      <div
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(event) => {
                          event.preventDefault();
                          setDragActive(false);
                          void handleFiles(event.dataTransfer.files);
                        }}
                        className={cn(
                          "flex flex-col items-center justify-between gap-3 rounded-xl border-2 border-dashed p-4 text-center transition-colors sm:flex-row sm:text-left",
                          dragActive
                            ? "border-primary bg-primary/5"
                            : "border-border/80 bg-gradient-to-r from-primary/[0.04] via-transparent to-[#0e9488]/[0.05]",
                        )}
                      >
                        <div className="flex flex-col items-center gap-3 sm:flex-row">
                          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                            <UploadCloud className="size-5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold">Drop your course material here</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              PDF, PowerPoint, Markdown or text · up to 25 MB each · max 8 files
                            </p>
                          </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-lg text-xs" onClick={() => fileInputRef.current?.click()}>
                          <FileUp className="mr-1.5 size-3.5" /> Browse files
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.pptx,.txt,.md,.markdown"
                          className="sr-only"
                          onChange={(event) => {
                            if (event.target.files) void handleFiles(event.target.files);
                            event.target.value = "";
                          }}
                        />
                      </div>

                      {uploads.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {uploads.map((upload) => (
                            <li key={upload.id} className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-background px-3 py-2">
                              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                                <FileText className="size-3.5" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[11px] font-medium">{upload.name}</p>
                                <p className={cn("truncate text-[10px]", upload.status === "error" ? "text-destructive" : "text-muted-foreground")}>
                                  {upload.status === "reading" && "Reading file…"}
                                  {upload.status === "error" && upload.error}
                                  {upload.status === "done" &&
                                    `${upload.pages ? `${upload.pages} ${fileExtension(upload.name) === "pptx" ? "slides" : "pages"} · ` : ""}${formatBytes(upload.size)}${upload.warning ? " · check extraction" : ""}`}
                                </p>
                              </div>
                              {upload.status === "reading" ? (
                                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                              ) : upload.status === "done" ? (
                                <Check className="size-3.5 text-[#0e9488]" />
                              ) : (
                                <AlertCircle className="size-3.5 text-destructive" />
                              )}
                              <button type="button" onClick={() => removeUpload(upload)} aria-label={`Remove ${upload.name}`} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                                <X className="size-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-4 grid gap-1.5">
                        <Label htmlFor="material-title" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Note set title <span className="font-normal normal-case tracking-normal text-muted-foreground/70">(optional)</span>
                        </Label>
                        <Input
                          id="material-title"
                          value={materialTitle}
                          onChange={(event) => setMaterialTitle(event.target.value)}
                          placeholder="e.g. Cell respiration — Unit 4"
                          maxLength={120}
                          className="h-9 bg-background text-xs"
                        />
                      </div>

                      <div className="mt-3">
                        <div className="flex flex-wrap items-end justify-between gap-2">
                          <Label htmlFor="material-text" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Review and edit what we read
                          </Label>
                          <span className="text-[10px] text-muted-foreground">
                            {materialWords.toLocaleString()} words
                            {totalPages ? ` · ${totalPages} ${uploads.some((upload) => fileExtension(upload.name) === "pptx") ? "pages/slides" : "pages"}` : ""}
                            {" · "}
                            <span className={cn(materialLimitReached && "font-semibold text-[#c2781a]")}>
                              {materialText.length.toLocaleString()}/{MAX_MATERIAL_CHARS.toLocaleString()} characters
                            </span>
                          </span>
                        </div>
                        <Textarea
                          id="material-text"
                          value={materialText}
                          onChange={(event) => {
                            setMaterialText(event.target.value.slice(0, MAX_MATERIAL_CHARS));
                            if (error) setError(null);
                          }}
                          placeholder="Paste lecture notes, a textbook section, your own summary, or anything else you want to learn from. Uploaded files appear here so you can fix extraction mistakes before generating."
                          rows={7}
                          className="mt-1.5 resize-y bg-background text-xs leading-6"
                        />
                        <p className="mt-1 text-[10px] text-muted-foreground/80">
                          We keep page and slide markers so your notes can cite where information came from. Scanned PDFs without readable text need to be pasted instead.
                        </p>
                        {materialLimitReached && (
                          <p className="mt-1 text-[10px] font-medium text-[#a8730f]">
                            You’ve reached the 30,000-character limit. Only this portion of the material will be used for generation.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-5 flex flex-col gap-3 border-t border-border/70 pt-4 lg:flex-row lg:items-center">
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <Select value={settings.detail} onValueChange={(value) => setSettings((prev) => ({ ...prev, detail: value as DetailLevel }))}>
                      <SelectTrigger className="h-8 w-auto min-w-[130px] gap-1.5 rounded-lg border-border/80 bg-background px-2.5 text-xs" aria-label="Depth">
                        <Layers className="size-3.5 text-muted-foreground" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DETAIL_LEVELS.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={settings.language} onValueChange={(value) => setSettings((prev) => ({ ...prev, language: value }))}>
                      <SelectTrigger className="h-8 w-auto min-w-[108px] gap-1.5 rounded-lg border-border/80 bg-background px-2.5 text-xs" aria-label="Language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-2 py-1.5">
                      <Palette className="size-3.5 text-muted-foreground" />
                      <div className="flex items-center gap-1">
                        {NOTE_THEMES.map((item) => (
                          <Tooltip key={item.id}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                aria-label={`${item.name} theme`}
                                aria-pressed={theme === item.id}
                                onClick={() => setTheme(item.id)}
                                className={cn(
                                  "size-4 rounded-full border transition-transform hover:scale-110",
                                  theme === item.id ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : "border-border",
                                )}
                                style={{ background: `linear-gradient(135deg, ${item.swatch[0]} 50%, ${item.swatch[2]} 50%)` }}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[10px]">
                              {item.name}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAdvanced((value) => !value)}
                      className={cn(
                        "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors",
                        advanced ? "border-primary/30 bg-primary/5 text-primary" : "border-border/80 bg-background text-muted-foreground hover:text-foreground",
                      )}
                      aria-expanded={advanced}
                    >
                      <SlidersHorizontal className="size-3.5" />
                      Fine-tune
                      <ChevronDown className={cn("size-3 transition-transform", advanced && "rotate-180")} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {mode === "topic" && (
                      <Button type="button" variant="outline" size="sm" onClick={loadSample} disabled={sampleBusy || busy} className="rounded-lg border-border/80 text-xs">
                        {sampleBusy ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <BookOpen className="mr-1.5 size-3.5" />}
                        Example
                      </Button>
                    )}
                    <Button type="button" onClick={forge} disabled={busy || (mode === "material" && isExtracting)} className="h-9 rounded-lg px-4 text-[13px] font-semibold shadow-sm">
                      {busy || (mode === "material" && isExtracting) ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                      {mode === "material" && isExtracting ? "Reading files…" : "Create notes"}
                    </Button>
                  </div>
                </div>

                {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}

                <AnimatePresence initial={false}>
                  {advanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 grid gap-5 border-t border-border/70 pt-5 lg:grid-cols-[1fr_1fr]">
                        <div className="space-y-4">
                          <div className="grid gap-1.5">
                            <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Written for</Label>
                            <Select value={settings.audience} onValueChange={(value) => setSettings((prev) => ({ ...prev, audience: value }))}>
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {AUDIENCES.map((audience) => (
                                  <SelectItem key={audience} value={audience}>
                                    {audience}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-1.5">
                            <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Focus</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: "concept" as const, label: "Concept-first", Icon: Lightbulb, blurb: "Understand deeply" },
                                { id: "exam" as const, label: "Exam-first", Icon: GraduationCap, blurb: "Score higher" },
                              ].map((option) => (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => setSettings((prev) => ({ ...prev, mode: option.id }))}
                                  className={cn(
                                    "flex items-start gap-2 rounded-xl border p-3 text-left transition-colors",
                                    settings.mode === option.id ? "border-primary/40 bg-primary/5" : "border-border/80 bg-background hover:border-border",
                                  )}
                                >
                                  <option.Icon className={cn("mt-0.5 size-4", settings.mode === option.id ? "text-primary" : "text-muted-foreground")} />
                                  <span>
                                    <span className="block text-xs font-semibold">{option.label}</span>
                                    <span className="mt-0.5 block text-[10px] text-muted-foreground">{option.blurb}</span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2.5 rounded-xl border border-border/70 bg-muted/30 p-3">
                            {[
                              { key: "diagrams" as const, label: "Diagrams & flowcharts", Icon: Layers },
                              { key: "examples" as const, label: "Real-world examples", Icon: Lightbulb },
                              { key: "practice" as const, label: "Practice questions", Icon: GraduationCap },
                            ].map((toggle) => (
                              <div key={toggle.key} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs">
                                  <toggle.Icon className="size-3.5 text-muted-foreground" />
                                  {toggle.label}
                                </div>
                                <Switch
                                  checked={settings[toggle.key]}
                                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, [toggle.key]: checked }))}
                                  aria-label={toggle.label}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid gap-1.5">
                            <Label htmlFor="custom-instruction" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              Custom instruction <span className="font-normal normal-case tracking-normal text-muted-foreground/70">(optional)</span>
                            </Label>
                            <Textarea
                              id="custom-instruction"
                              value={settings.customInstruction}
                              onChange={(event) => setSettings((prev) => ({ ...prev, customInstruction: event.target.value }))}
                              placeholder="e.g. Use cooking analogies, keep it concise enough to revise in one evening, focus on the 2024 syllabus…"
                              rows={4}
                              maxLength={500}
                              className="resize-none bg-background text-xs leading-6"
                            />
                            <p className="text-right text-[10px] text-muted-foreground/60">{settings.customInstruction.length}/500</p>
                          </div>

                          <div className={cn("note-canvas rounded-xl border p-4", (NOTE_THEMES.find((item) => item.id === theme) ?? NOTE_THEMES[0]).className)} style={{ borderColor: "var(--np-border)" }}>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--np-accent)" }}>
                              Theme preview · {(NOTE_THEMES.find((item) => item.id === theme) ?? NOTE_THEMES[0]).name}
                            </p>
                            <p className="np-heading mt-1.5 font-display text-sm font-bold" style={{ color: "var(--np-heading)" }}>
                              {mode === "material" ? materialTitle.trim() || "Your study guide title" : topic.trim() || "Your study guide title"}
                            </p>
                            <p className="mt-1 line-clamp-2 text-[10px] leading-4" style={{ color: "var(--np-muted)" }}>
                              {(NOTE_THEMES.find((item) => item.id === theme) ?? NOTE_THEMES[0]).blurb}. Chapters, diagrams and practice are designed to match.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Notes library */}
          <section id="projects" className="mt-12 scroll-mt-24">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight">Your notes</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Pick up where you left off, or open a set to restyle it.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search your notes…"
                  aria-label="Search notes"
                  className="h-9 rounded-lg bg-card pl-8 text-xs"
                />
              </div>
            </div>

            {projects === undefined ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-[210px] animate-pulse rounded-2xl border border-border/60 bg-card p-3">
                    <div className="h-[116px] rounded-xl bg-muted" />
                    <div className="mt-4 h-3 w-3/4 rounded bg-muted" />
                    <div className="mt-2 h-2.5 w-1/2 rounded bg-muted/70" />
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/8 text-primary">
                  <FileText className="size-5" />
                </div>
                <h3 className="font-display mt-4 text-base font-bold">No notes yet</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                  Start with a topic above, or upload the material you already have. EduNotes Pro will turn it into a study guide you can edit.
                </p>
                <Button variant="outline" size="sm" className="mt-4 text-xs" onClick={loadSample}>
                  <BookOpen className="mr-1.5 size-3.5" /> Explore example notes
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
                <p className="text-sm font-semibold">No matches for “{search}”</p>
                <p className="mt-1 text-xs text-muted-foreground">Try a different title or subject.</p>
              </div>
            ) : (
              <motion.div layout className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((project) => (
                    <ProjectCard key={project._id} project={project} onDelete={handleDelete} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </section>

          <section className="mt-14 border-t border-border/60 pt-8">
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { step: "01", title: "Bring what you have", text: "Upload slides and readings, paste your notes, or simply name a topic." },
                { step: "02", title: "Let it teach you back", text: "The AI maps the material, sequences chapters and writes each one in depth." },
                { step: "03", title: "Make it unmistakably yours", text: "Edit inline, drag blocks around, then restyle with six editorial themes." },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <span className="font-mono text-[11px] font-bold text-primary">{item.step}</span>
                  <div>
                    <p className="text-xs font-semibold">{item.title}</p>
                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </TooltipProvider>
    </AppShell>
  );
}
