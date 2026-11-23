import { Logo } from "@/components/brand/Logo";
import { HeroFluid } from "@/components/effects/HeroFluid";
import { Magnetic } from "@/components/effects/Magnetic";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Formula } from "@/components/notes/Formula";
import { useAuth } from "@/hooks/use-auth";
import { NOTE_THEMES, themeById } from "@/lib/note-types";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  FileText,
  FileUp,
  GripVertical,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Palette,
  PenLine,
  Plus,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const DEMO_SOURCES = [
  {
    kind: "file" as const,
    label: "CS-229-lecture-07.pdf",
    meta: "18 pages · PDF",
    title: "Neural networks",
  },
  {
    kind: "topic" as const,
    label: "Backpropagation",
    meta: "Topic",
    title: "Backpropagation",
  },
  {
    kind: "file" as const,
    label: "Week 6 — Training deep networks.pptx",
    meta: "14 slides · PowerPoint",
    title: "Training deep networks",
  },
];

const DEMO_STEPS = ["Reading", "Understanding", "Structuring", "Writing", "Designing"];

function LiveStudioDemo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 2800);
    return () => window.clearInterval(timer);
  }, []);

  const source = DEMO_SOURCES[Math.floor(tick / 5) % DEMO_SOURCES.length];
  const step = tick % 5;
  const showNotes = step >= 3;
  const progress = [12, 28, 48, 78, 100][step];

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-5 rounded-[40px] opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 70% 20%, rgba(60,86,224,0.32), transparent 70%), radial-gradient(50% 50% at 20% 80%, rgba(11,143,134,0.24), transparent 70%), radial-gradient(35% 35% at 90% 85%, rgba(242,191,94,0.2), transparent 70%)",
        }}
      />

      <div className="relative rounded-[26px] border border-border/80 bg-card/90 p-2.5 shadow-[0_30px_80px_-40px_rgb(20_22_40/0.45)] backdrop-blur-xl sm:p-3">
        <div className="rounded-[20px] border border-border/70 bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#e8795f]" />
              <span className="size-2 rounded-full bg-[#f2bf5e]" />
              <span className="size-2 rounded-full bg-[#42b7a1]" />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/60">EduNotes Pro · live</span>
          </div>

          <div className="mt-4 rounded-xl border border-border/80 bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary">
                {source.kind === "file" ? <FileUp className="size-3" /> : <Sparkles className="size-3" />}
                {source.kind === "file" ? "Your material" : "Your topic"}
              </div>
              <span className="font-mono text-[8px] text-muted-foreground/60">{source.meta}</span>
            </div>
            <div className="mt-1.5 flex min-h-6 items-center gap-1 text-[13px] font-medium">
              <AnimatePresence mode="wait">
                <motion.span
                  key={source.label}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="truncate"
                >
                  {source.label}
                </motion.span>
              </AnimatePresence>
              <motion.span
                aria-hidden
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                className="inline-block h-4 w-px shrink-0 bg-primary"
              />
            </div>
          </div>

          <div className="mt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #3c56e0, #0b8f86 70%, #f2bf5e)" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              {DEMO_STEPS.map((label, index) => (
                <span
                  key={label}
                  className={cn(
                    "flex items-center gap-1 text-[9px] font-medium transition-colors",
                    index < step ? "text-[#0b8f86]" : index === step ? "text-foreground" : "text-muted-foreground/50",
                  )}
                >
                  {index < step ? (
                    <Check className="size-2.5" />
                  ) : (
                    <span className={cn("size-1 rounded-full", index === step ? "animate-pulse bg-primary" : "bg-muted-foreground/30")} />
                  )}
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="note-canvas notes-midnight mt-2.5 min-h-[248px] overflow-hidden rounded-[20px] border p-4 sm:p-5" style={{ borderColor: "var(--np-border-strong)" }}>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--np-accent)" }}>
              <FileText className="size-2.5" /> {showNotes ? "Chapter 01" : "Outline"}
            </span>
            <span className="rounded-full border px-1.5 py-0.5 font-mono text-[8px]" style={{ borderColor: "var(--np-border)", color: "var(--np-muted)" }}>
              {showNotes ? (source.kind === "file" ? "From your material · p. 4" : "AI explanation") : "reading"}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {showNotes ? (
              <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <h3 className="np-heading mt-2.5 text-lg font-extrabold leading-tight" style={{ color: "var(--np-heading)" }}>
                  {source.title}
                </h3>
                <p className="mt-1.5 text-[10px] leading-4" style={{ color: "var(--np-muted)" }}>
                  A clear model first, then the mechanics, then the details that make it precise.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="rounded-xl border p-2.5"
                    style={{ background: "var(--np-card)", borderColor: "var(--np-border)" }}
                  >
                    <p className="text-[7px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--np-accent)" }}>Definition</p>
                    <p className="np-heading mt-1 text-[11px] font-bold" style={{ color: "var(--np-heading)" }}>Core idea</p>
                    <p className="mt-1 text-[9px] leading-3.5" style={{ color: "var(--np-muted)" }}>The one precise idea the rest of the chapter builds on.</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="rounded-xl border p-2.5"
                    style={{ background: "var(--np-card)", borderColor: "var(--np-border)" }}
                  >
                    <p className="text-[7px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--np-accent-2)" }}>Formula</p>
                    <div className="mt-1.5 overflow-hidden text-[8px]" style={{ color: "var(--np-heading)" }}>
                      <Formula value="\hat{y} = \sigma(Wx + b)" />
                    </div>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: step === 4 ? 0.34 : 0.9 }}
                  className="mt-2 rounded-xl border p-2.5"
                  style={{ background: "var(--np-accent-soft)", borderColor: "color-mix(in oklab, var(--np-accent) 28%, transparent)" }}
                >
                  <p className="flex items-center gap-1 text-[7px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--np-accent)" }}>
                    <Lightbulb className="size-2.5" /> Important
                  </p>
                  <p className="mt-1 text-[9px] leading-3.5" style={{ color: "var(--np-fg)" }}>
                    Non-linear activations are what let a stack of layers model complex patterns.
                  </p>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key={`outline-${tick}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2">
                {[0, 1, 2, 3].map((row) => (
                  <div key={row} className="flex items-center gap-2">
                    <span className="font-mono text-[8px]" style={{ color: "var(--np-accent)" }}>{String(row + 1).padStart(2, "0")}</span>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${[72, 58, 66, 44][row]}%`,
                        background: row === step % 4 ? "var(--np-accent-soft)" : "var(--np-border)",
                      }}
                    />
                  </div>
                ))}
                <p className="pt-2 text-[9px]" style={{ color: "var(--np-muted)" }}>
                  Reading the structure, mapping concepts and planning the teaching order…
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute -bottom-4 -left-2 hidden items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-2 shadow-lg sm:flex"
      >
        <span className="grid size-6 place-items-center rounded-lg bg-primary/10 text-primary">
          <PenLine className="size-3" />
        </span>
        <div>
          <p className="text-[10px] font-semibold leading-none">Edit any line</p>
          <p className="mt-1 text-[8px] text-muted-foreground">Autosaved as you type</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute -right-2 top-16 hidden items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-2 shadow-lg sm:flex"
      >
        <ShieldCheck className="size-3.5 text-[#0b8f86]" />
        <p className="text-[10px] font-semibold">Source-tagged</p>
      </motion.div>
    </div>
  );
}

const PREVIEW_BLOCKS = {
  definition: (
    <div className="rounded-xl border p-3" style={{ background: "var(--np-card)", borderColor: "var(--np-border)" }}>
      <p className="text-[8px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--np-accent)" }}>Definition</p>
      <p className="np-heading mt-1.5 text-sm font-extrabold" style={{ color: "var(--np-heading)" }}>Gradient descent</p>
      <p className="mt-1 text-[11px] leading-5" style={{ color: "var(--np-fg)" }}>
        An iterative method that moves parameters in the direction that most steeply reduces a loss function.
      </p>
    </div>
  ),
  formula: (
    <div className="rounded-xl border p-3" style={{ background: "var(--np-card)", borderColor: "var(--np-border)" }}>
      <p className="text-[8px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--np-accent)" }}>Formula</p>
      <div className="mt-2 overflow-x-auto text-center text-[13px]" style={{ color: "var(--np-heading)" }}>
        <Formula value="w_{t+1} = w_t - \eta \nabla L(w_t)" />
      </div>
    </div>
  ),
};

function ThemePreview() {
  const [themeId, setThemeId] = useState("midnight");
  const theme = themeById(themeId);

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {NOTE_THEMES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setThemeId(item.id)}
            aria-pressed={themeId === item.id}
            data-tilt="4"
            data-spotlight
            className={cn(
              "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all",
              themeId === item.id ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border/80 bg-card hover:border-border hover:bg-muted/40",
            )}
          >
            <span
              className="size-7 shrink-0 rounded-lg border border-black/5"
              style={{ background: `linear-gradient(135deg, ${item.swatch[0]} 0%, ${item.swatch[1]} 55%, ${item.swatch[2]} 100%)` }}
            />
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-[11px] font-semibold">
                {item.name}
                {themeId === item.id && <Check className="size-3 text-primary" />}
              </span>
              <span className="block truncate text-[9px] text-muted-foreground">{item.blurb}</span>
            </span>
          </button>
        ))}
      </div>

      <div className={cn("note-canvas overflow-hidden rounded-[22px] border p-5 sm:p-7", theme.className)} style={{ borderColor: "var(--np-border-strong)", boxShadow: "var(--np-shadow)" }}>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--np-accent)" }}>
            <Sparkles className="size-2.5" /> Machine learning · study notes
          </span>
          <span className="rounded-full border px-2 py-0.5 font-mono text-[8px]" style={{ borderColor: "var(--np-border)", color: "var(--np-muted)" }}>
            {theme.name}
          </span>
        </div>
        <h3 className="np-heading mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: "var(--np-heading)" }}>
          Gradient descent
        </h3>
        <p className="mt-1.5 max-w-md text-[11px] leading-5" style={{ color: "var(--np-muted)" }}>
          How a model finds its way downhill — and why the learning rate decides whether it ever arrives.
        </p>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {PREVIEW_BLOCKS.definition}
          {PREVIEW_BLOCKS.formula}
        </div>
        <div className="mt-2.5 rounded-xl border p-3" style={{ background: "linear-gradient(135deg, var(--np-accent-soft), transparent), var(--np-card)", borderColor: "var(--np-border-strong)" }}>
          <p className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--np-accent)" }}>
            <Sparkles className="size-2.5" /> Key takeaways
          </p>
          <ul className="mt-2 space-y-1.5">
            {["Gradients point uphill, so we subtract them.", "The learning rate controls step size, not direction.", "Validation loss tells you when to stop."].map((item, index) => (
              <li key={item} className="flex items-start gap-2 text-[10px] leading-4" style={{ color: "var(--np-fg)" }}>
                <span className="font-mono text-[8px] font-bold" style={{ color: "var(--np-accent)" }}>{String(index + 1).padStart(2, "0")}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-[8px] uppercase tracking-[0.14em]" style={{ color: "var(--np-muted)" }}>
          AI explanation · editable · autosaved
        </p>
      </div>
    </div>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? "/dashboard" : "/auth?returnTo=/dashboard";
  const primaryLabel = isAuthenticated ? "Open your workspace" : "Create your first notes";

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex" aria-label="Landing navigation">
            <a href="#platform" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">Platform</a>
            <a href="#themes" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">Themes</a>
            <a href="#how" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">How it works</a>
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            {!isAuthenticated && (
              <Button variant="ghost" size="sm" asChild className="hidden text-[13px] sm:inline-flex">
                <Link to="/auth?returnTo=/dashboard">Sign in</Link>
              </Button>
            )}
            <Button size="sm" asChild className="h-9 rounded-lg px-3.5 text-[13px] font-semibold">
              <Link to={primaryHref}>
                {isAuthenticated ? "Dashboard" : "Get started"}
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="paper-grid pointer-events-none absolute inset-0" />
          <div aria-hidden className="hero-mesh">
            <span className="hero-mesh__blob hero-mesh__blob--violet" />
            <span className="hero-mesh__blob hero-mesh__blob--cyan" />
            <span className="hero-mesh__blob hero-mesh__blob--gold" />
          </div>
          <HeroFluid />
          <div className="relative z-10 mx-auto grid max-w-[1180px] items-center gap-14 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.02fr_1fr] lg:gap-10 lg:pb-24 lg:pt-20">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm">
                <span className="flex size-4 items-center justify-center rounded-full bg-[#f2bf5e]/20 text-[#b47c12]">
                  <Sparkles className="size-2.5" />
                </span>
                Premium notes for students
              </div>
              <h1 className="font-display mt-5 text-[42px] font-extrabold leading-[1.03] tracking-[-0.04em] sm:text-[58px] lg:text-[64px]">
                Turn what you’re given into{" "}
                <span className="brand-gradient-text">notes worth keeping.</span>
              </h1>
              <p className="mt-5 max-w-[530px] text-[15px] leading-7 text-muted-foreground sm:text-base sm:leading-8">
                EduNotes Pro reads your lecture slides, readings and course notes — then writes a structured, deeply explained study guide. Edit every line, restyle it in a click, and keep it in your own workspace.
              </p>
              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <Magnetic className="inline-flex">
                  <Button size="lg" asChild className="h-11 rounded-xl px-5 text-sm font-semibold shadow-sm">
                    <Link to={primaryHref}>
                      {primaryLabel}
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </Magnetic>
                <Button size="lg" variant="outline" asChild className="h-11 rounded-xl px-5 text-sm">
                  <a href="#themes">
                    Explore the themes
                    <ChevronRight className="ml-1.5 size-4" />
                  </a>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="size-3.5 text-[#0b8f86]" /> Upload or paste your material</span>
                <span className="flex items-center gap-1.5"><Check className="size-3.5 text-[#0b8f86]" /> Your own dashboard</span>
                <span className="flex items-center gap-1.5"><Check className="size-3.5 text-[#0b8f86]" /> Edit everything</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.97, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
              <LiveStudioDemo />
            </motion.div>
          </div>
        </section>

        {/* Proof strip */}
        <section className="border-y border-border/60 bg-card/50">
          <div data-reveal className="mx-auto grid max-w-[1180px] grid-cols-2 divide-x divide-border/60 px-5 sm:grid-cols-4 sm:px-8">
            {[
              { value: "PDF · PPTX", label: "and pasted material", tone: "#3c56e0" },
              { value: "19", label: "visual block types", tone: "#0b8f86" },
              { value: "6", label: "complete themes", tone: "#c98b22" },
              { value: "1", label: "private study workspace", tone: "#c2553e" },
            ].map((stat) => (
              <div key={stat.label} className="px-4 py-6 first:pl-0 sm:px-6">
                <span className="mb-2 block h-1 w-6 rounded-full" style={{ background: stat.tone }} />
                <p className="font-display text-xl font-extrabold tracking-tight sm:text-[26px]">{stat.value}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="platform" className="mx-auto max-w-[1180px] scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24">
          <Reveal className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">The platform</p>
            <h2 className="font-display mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-[40px] sm:leading-[1.1]">
              Serious notes, built around your actual coursework.
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Not a blank chat box. EduNotes Pro is a complete study workspace: bring your material, get a structured guide, then shape it until it works for you.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Reveal className="md:col-span-2" delay={0.05}>
              <div data-spotlight className="soft-card lift h-full rounded-[24px] p-6 sm:p-8">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UploadCloud className="size-5" />
                </div>
                <h3 className="font-display mt-4 text-xl font-bold tracking-tight">Start with the material you already have</h3>
                <p className="mt-2 max-w-lg text-[13px] leading-6 text-muted-foreground">
                  Upload a lecture PDF, a slide deck or your own notes. Paste a reading if that’s easier. EduNotes Pro extracts the structure, preserves technical terms and shows you exactly what it read before writing a single section.
                </p>
                <div className="mt-6 space-y-2">
                  {[
                    { name: "CS-229 Lecture 07.pdf", meta: "18 pages · extracted", color: "#3c56e0" },
                    { name: "Week 6 — Training deep networks.pptx", meta: "14 slides · extracted", color: "#0b8f86" },
                  ].map((file) => (
                    <div key={file.name} className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-background px-3 py-2">
                      <span className="grid size-7 place-items-center rounded-md text-white" style={{ background: file.color }}>
                        <FileText className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[11px] font-medium">{file.name}</span>
                      <span className="text-[9px] text-muted-foreground">{file.meta}</span>
                      <Check className="size-3.5 text-[#0b8f86]" />
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div data-spotlight className="soft-card lift flex h-full flex-col rounded-[24px] p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#0b8f86]/10 text-[#0b8f86]">
                  <Layers className="size-5" />
                </div>
                <h3 className="font-display mt-4 text-lg font-bold tracking-tight">Notes that teach, not summarize</h3>
                <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
                  Every chapter is explained from first principles, with definitions, worked examples, diagrams and practice questions where they help.
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                  {["Definition", "Formula", "Flowchart", "Solved problem", "Quiz", "Glossary"].map((tag) => (
                    <span key={tag} className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div data-spotlight className="soft-card lift flex h-full flex-col rounded-[24px] p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#c98b22]/10 text-[#b47c12]">
                  <LayoutDashboard className="size-5" />
                </div>
                <h3 className="font-display mt-4 text-lg font-bold tracking-tight">Your own workspace</h3>
                <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
                  Every set lives in your dashboard with its progress and edits saved. Come back after class and pick up exactly where you stopped.
                </p>
                <div className="mt-auto flex items-center gap-2 pt-5 text-[10px] text-muted-foreground">
                  <span className="size-2 rounded-full bg-[#42b7a1]" /> Autosaved
                  <span className="ml-2 size-2 rounded-full bg-[#f2bf5e]" /> Private
                </div>
              </div>
            </Reveal>

            <Reveal className="md:col-span-2" delay={0.1}>
              <div data-spotlight className="soft-card lift h-full rounded-[24px] p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#c2553e]/10 text-[#c2553e]">
                      <Palette className="size-5" />
                    </div>
                    <h3 className="font-display mt-4 text-xl font-bold tracking-tight">Restyle without rewriting</h3>
                    <p className="mt-2 max-w-md text-[13px] leading-6 text-muted-foreground">
                      Switch six editorial themes, change the heading voice, and adjust the page width. Typography, callouts, cards and formulas move together — your content stays exactly where you left it.
                    </p>
                  </div>
                  <div className="w-full max-w-[270px] rounded-xl border border-border/80 bg-background p-3.5 shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground">
                      <GripVertical className="size-3" /> Chapter 02
                      <span className="ml-auto flex gap-1">
                        <span className="rounded border border-border px-1 py-0.5 text-[8px]">Undo</span>
                        <span className="rounded border border-border px-1 py-0.5 text-[8px]">Redo</span>
                      </span>
                    </div>
                    <p className="mt-2.5 text-[12px] font-semibold leading-5">
                      Backpropagation is the chain rule, applied efficiently.
                      <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-primary align-middle" />
                    </p>
                    <div className="mt-3 flex gap-1.5">
                      {NOTE_THEMES.map((theme) => (
                        <span key={theme.id} className="size-5 rounded-md border border-black/5" style={{ background: `linear-gradient(135deg, ${theme.swatch[0]}, ${theme.swatch[2]})` }} title={theme.name} />
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[9px] text-primary">
                      <Plus className="size-2.5" /> Add block
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <div data-spotlight className="mt-4 flex flex-col gap-4 rounded-[24px] border border-primary/15 bg-gradient-to-r from-primary/[0.06] via-card to-[#0b8f86]/[0.06] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <p className="font-display text-base font-bold">Source-honest by design.</p>
                  <p className="mt-1 max-w-xl text-[12px] leading-6 text-muted-foreground">
                    Material-derived content is tagged <span className="font-semibold text-foreground">From your material</span> with a page or slide reference. Added explanations are tagged <span className="font-semibold text-foreground">AI explanation</span>, so you always know what came from where.
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-[#0b8f86]/25 bg-[#0b8f86]/8 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0b7a72]">
                No silent substitutions
              </span>
            </div>
          </Reveal>
        </section>

        {/* Themes */}
        <section id="themes" className="scroll-mt-20 border-y border-border/60 bg-card/40 py-20 sm:py-24">
          <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
            <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b8f86]">Designed to be read</p>
                <h2 className="font-display mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-[40px] sm:leading-[1.1]">
                  One guide. Six completely different looks.
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Switch the theme at any moment. Typography, callout colors, cards and formula styling all move together — your content stays exactly where you left it.
                </p>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1.5 text-[10px] font-medium text-muted-foreground sm:flex">
                <PenLine className="size-3" /> Live preview
              </span>
            </Reveal>
            <div data-reveal className="mt-8">
              <ThemePreview />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-[1180px] scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24">
          <Reveal className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a620e] dark:text-[#f2bf5e]">How it works</p>
            <h2 className="font-display mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-[40px] sm:leading-[1.1]">
              From coursework to a serious study session.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {[
              {
                n: "01",
                title: "Bring your material",
                body: "Upload slides, PDFs, Markdown or text — or paste a reading or name a topic. Check what was extracted and fix anything before you continue.",
                color: "#3c56e0",
              },
              {
                n: "02",
                title: "Let it read and teach",
                body: "The AI maps the structure, sequences chapters, then writes detailed explanations with examples, diagrams and practice, keeping source references intact.",
                color: "#0b8f86",
              },
              {
                n: "03",
                title: "Make it yours",
                body: "Rewrite any line, reorder blocks, insert formulas, and switch between six themes until the guide feels like something you’ll actually use.",
                color: "#c98b22",
              },
            ].map((step, index) => (
              <Reveal key={step.n} delay={index * 0.08}>
                <div data-spotlight className="relative h-full rounded-2xl border border-border/70 bg-card p-6">
                  <span className="font-mono text-[10px] font-bold" style={{ color: step.color }}>{step.n}</span>
                  <h3 className="font-display mt-3 text-base font-bold">{step.title}</h3>
                  <p className="mt-2 text-[12px] leading-6 text-muted-foreground">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[1180px] px-5 pb-20 sm:px-8 sm:pb-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 px-6 py-14 text-center sm:px-12" style={{ background: "linear-gradient(135deg, #101420 0%, #1a2856 52%, #0b3f3b 100%)" }}>
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(circle at 18% 18%, rgba(90,120,255,0.42), transparent 42%), radial-gradient(circle at 82% 72%, rgba(40,200,180,0.26), transparent 42%), radial-gradient(circle at 70% 15%, rgba(242,191,94,0.16), transparent 30%)" }} />
              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f2bf5e]">Everything you need is already on your desk</p>
                <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-[42px]">
                  Turn this week’s coursework into notes you’ll actually study.
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/60">
                  Bring the PDF, the slide deck, or the topic you keep meaning to understand. Leave with a guide that teaches it back.
                </p>
                <Magnetic className="mt-7 inline-flex">
                  <Button size="lg" asChild className="h-11 rounded-xl bg-white px-6 text-sm font-semibold text-[#111420] hover:bg-white/90">
                    <Link to={primaryHref}>
                      {primaryLabel}
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </Magnetic>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div data-reveal className="mx-auto flex max-w-[1180px] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <Logo />
            <span className="text-[11px] text-muted-foreground">Serious notes for serious study.</span>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-[11px] text-muted-foreground">
            <a href="#platform" className="transition-colors hover:text-foreground">Platform</a>
            <a href="#themes" className="transition-colors hover:text-foreground">Themes</a>
            <Link to={primaryHref} className="transition-colors hover:text-foreground">Get started</Link>
            <span className="text-muted-foreground/60">For students and learning organizations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
