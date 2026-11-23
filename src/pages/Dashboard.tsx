import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Clock,
  FileText,
  GraduationCap,
  Layers,
  Loader2,
  MoreHorizontal,
  Palette,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SUGGESTIONS = [
  "Gradient descent",
  "The Krebs cycle",
  "Bayesian statistics",
  "SQL joins",
  "Cognitive biases",
  "The Cold War",
];

const STAGE_LABEL: Record<string, string> = {
  reading: "Brewing",
  understanding: "Brewing",
  structuring: "Structuring",
  writing: "Writing",
  designing: "Designing",
  done: "Ready",
  error: "Needs attention",
};

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
      className="group relative rounded-2xl border border-border/70 bg-card p-3 shadow-[0_1px_2px_rgb(20_22_40/0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-[0_18px_40px_-24px_rgb(20_22_40/0.28)]"
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
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(project._id, project.title)}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/notes/${project._id}`)}
        className="mt-3 block w-full text-left"
      >
        <p className="line-clamp-1 text-[13px] font-semibold">{project.title}</p>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
          {project.subtitle || (isReady ? `${project.blockCount} blocks · ${theme.name}` : "Being forged right now")}
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

  const [topic, setTopic] = useState("");
  const [settings, setSettings] = useState<NoteSettings>(DEFAULT_SETTINGS);
  const [theme, setTheme] = useState("midnight");
  const [search, setSearch] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sampleBusy, setSampleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.name?.split(" ")[0];
  const filtered = useMemo(() => {
    if (!projects) return [];
    const query = search.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter((project) =>
      `${project.title} ${project.subtitle ?? ""} ${project.subject ?? ""}`.toLowerCase().includes(query),
    );
  }, [projects, search]);

  const forge = async () => {
    const clean = topic.trim();
    if (clean.length < 3) {
      setError("Give your topic a little more detail — at least a few words.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const id = await createProject({ topic: clean, settings, theme });
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
        subtitle: "How machines learn to recognise patterns, in plain language and real depth.",
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
      toast.success("Study set deleted");
    } catch {
      toast.error("Could not delete that study set.");
    }
  };

  return (
    <AppShell>
      <TooltipProvider delayDuration={300}>
        <div className="mx-auto w-full max-w-[1180px] px-5 pb-20 pt-8 sm:px-8 sm:pt-10">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary" />
                Your studio
              </div>
              <h1 className="font-display mt-2 text-3xl font-extrabold tracking-[-0.03em] sm:text-[38px]">
                Create beautiful notes with AI
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
                {firstName ? `Welcome back, ${firstName}. ` : ""}Give NoteForge a topic. It teaches itself the subject, then designs a study guide you can edit and restyle.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-xs text-muted-foreground">
              <BookOpen className="size-4 text-primary" />
              <span className="font-semibold text-foreground">{projects?.length ?? 0}</span> study sets
            </div>
          </header>

          {/* Composer */}
          <section id="compose" className="mt-7 scroll-mt-24">
            <div className="relative overflow-hidden rounded-[22px] border border-border/80 bg-card shadow-[0_2px_4px_rgb(20_22_40/0.03),0_24px_60px_-40px_rgb(20_22_40/0.35)]">
              <div className="brand-gradient absolute inset-x-0 top-0 h-[3px]" />
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Wand2 className="size-4" />
                    </span>
                    What do you want to learn?
                  </div>
                  <div className="hidden items-center gap-1.5 text-[10px] text-muted-foreground sm:flex">
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px]">⌘</kbd>
                    <span>+</span>
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px]">↵</kbd>
                    <span>to forge</span>
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
                  className="mt-3 min-h-[92px] resize-none border-0 bg-transparent px-0 text-[16px] leading-7 shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0 dark:bg-transparent sm:text-[17px]"
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

                <div className="mt-5 flex flex-col gap-3 border-t border-border/70 pt-4 lg:flex-row lg:items-center">
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <Select
                      value={settings.detail}
                      onValueChange={(value) => setSettings((prev) => ({ ...prev, detail: value as DetailLevel }))}
                    >
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
                        advanced
                          ? "border-primary/30 bg-primary/5 text-primary"
                          : "border-border/80 bg-background text-muted-foreground hover:text-foreground",
                      )}
                      aria-expanded={advanced}
                    >
                      <SlidersHorizontal className="size-3.5" />
                      Fine-tune
                      <ChevronDown className={cn("size-3 transition-transform", advanced && "rotate-180")} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadSample}
                      disabled={sampleBusy || busy}
                      className="rounded-lg border-border/80 text-xs"
                    >
                      {sampleBusy ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <BookOpen className="mr-1.5 size-3.5" />}
                      Example
                    </Button>
                    <Button
                      type="button"
                      onClick={forge}
                      disabled={busy}
                      className="h-9 rounded-lg px-4 text-[13px] font-semibold shadow-sm"
                    >
                      {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                      Forge notes
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
                            <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              Written for
                            </Label>
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
                            <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              Focus
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              {(
                                [
                                  { id: "concept" as const, label: "Concept-first", Icon: LightbulbIcon, blurb: "Understand deeply" },
                                  { id: "exam" as const, label: "Exam-first", Icon: GraduationCap, blurb: "Score higher" },
                                ]
                              ).map((option) => (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => setSettings((prev) => ({ ...prev, mode: option.id }))}
                                  className={cn(
                                    "flex items-start gap-2 rounded-xl border p-3 text-left transition-colors",
                                    settings.mode === option.id
                                      ? "border-primary/40 bg-primary/5"
                                      : "border-border/80 bg-background hover:border-border",
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
                            {(
                              [
                                { key: "diagrams" as const, label: "Diagrams & flowcharts", Icon: Layers },
                                { key: "examples" as const, label: "Real-world examples", Icon: LightbulbIcon },
                                { key: "practice" as const, label: "Practice questions", Icon: GraduationCap },
                              ]
                            ).map((toggle) => (
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
                              {topic.trim() || "Your study guide title"}
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

          {/* Projects */}
          <section id="projects" className="mt-12 scroll-mt-24">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight">Your study sets</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Pick up where you left off, or open one to restyle it.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search projects…"
                  aria-label="Search projects"
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
                <h3 className="font-display mt-4 text-base font-bold">No study sets yet</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                  Type a topic above and let NoteForge teach it back to you — in chapters, diagrams and practice questions.
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
                { step: "01", title: "Give a topic", text: "A phrase is enough. Add an exam date or an angle if you have one." },
                { step: "02", title: "The AI teaches itself", text: "It maps concepts, sequences chapters and writes each one in depth." },
                { step: "03", title: "Make it yours", text: "Edit inline, drag blocks around, then restyle with six editorial themes." },
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

// Small alias keeps the JSX above readable without shadowing the icon import.
function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M9 18h6m-5 3h4M12 2a6.5 6.5 0 0 0-4 11.6c.6.5 1 1.2 1 2V17h6v-1.4c0-.8.4-1.5 1-2A6.5 6.5 0 0 0 12 2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
