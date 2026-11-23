import { Logo } from "@/components/brand/Logo";
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
  GripVertical,
  Layers,
  Lightbulb,
  Palette,
  PenLine,
  Plus,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
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

const DEMO_TOPICS = [
  "How neural networks learn",
  "The chemistry of photosynthesis",
  "Bayesian statistics",
];

const DEMO_STEPS = ["Reading", "Understanding", "Structuring", "Writing", "Designing"];

function LiveStudioDemo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 2800);
    return () => window.clearInterval(timer);
  }, []);

  const topic = DEMO_TOPICS[Math.floor(tick / 5) % DEMO_TOPICS.length];
  const step = tick % 5;
  const showNotes = step >= 3;
  const progress = [12, 28, 48, 78, 100][step];

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-5 rounded-[40px] opacity-50 blur-3xl"
        style={{ background: "radial-gradient(60% 60% at 70% 20%, rgba(74,99,232,0.28), transparent 70%), radial-gradient(50% 50% at 20% 80%, rgba(18,150,143,0.2), transparent 70%)" }}
      />

      <div className="relative rounded-[26px] border border-border/80 bg-card/90 p-2.5 shadow-[0_30px_80px_-40px_rgb(20_22_40/0.45)] backdrop-blur-xl sm:p-3">
        <div className="rounded-[20px] border border-border/70 bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#f08a7d]" />
              <span className="size-2 rounded-full bg-[#efc36b]" />
              <span className="size-2 rounded-full bg-[#77c7a0]" />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/60">NoteForge · live</span>
          </div>

          <div className="mt-4 rounded-xl border border-border/80 bg-card p-3">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="size-3" /> Topic
            </div>
            <div className="mt-1.5 flex min-h-6 items-center gap-1 text-[13px] font-medium">
              <AnimatePresence mode="wait">
                <motion.span
                  key={topic}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  {topic}
                </motion.span>
              </AnimatePresence>
              <motion.span
                aria-hidden
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                className="inline-block h-4 w-px bg-primary"
              />
            </div>
          </div>

          <div className="mt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #3b55d9, #12968f)" }}
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
                    index < step ? "text-primary" : index === step ? "text-foreground" : "text-muted-foreground/50",
                  )}
                >
                  {index < step ? <Check className="size-2.5" /> : <span className={cn("size-1 rounded-full", index === step ? "animate-pulse bg-primary" : "bg-muted-foreground/30")} />}
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="note-canvas notes-midnight mt-2.5 min-h-[248px] overflow-hidden rounded-[20px] border p-4 sm:p-5" style={{ borderColor: "var(--np-border-strong)" }}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--np-accent)" }}>
              <FileText className="size-2.5" /> {showNotes ? "Chapter 01" : "Outline"}
            </span>
            <span className="rounded-full border px-1.5 py-0.5 font-mono text-[8px]" style={{ borderColor: "var(--np-border)", color: "var(--np-muted)" }}>
              {showNotes ? "AI explanation" : "drafting"}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {showNotes ? (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="np-heading mt-2.5 text-lg font-extrabold leading-tight" style={{ color: "var(--np-heading)" }}>
                  {topic}
                </h3>
                <p className="mt-1.5 text-[10px] leading-4" style={{ color: "var(--np-muted)" }}>
                  A clear model first, then the mechanics, then the maths that makes it precise.
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
                    <span className="font-mono text-[8px]" style={{ color: "var(--np-accent)" }}>
                      {String(row + 1).padStart(2, "0")}
                    </span>
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
                  Mapping concepts, prerequisites and the order that makes them click…
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
        <Palette className="size-3.5 text-primary" />
        <p className="text-[10px] font-semibold">6 themes</p>
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
            className={cn(
              "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all",
              themeId === item.id
                ? "border-primary/50 bg-primary/5 shadow-sm"
                : "border-border/80 bg-card hover:border-border hover:bg-muted/40",
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
  const primaryLabel = isAuthenticated ? "Open your studio" : "Start forging — free";

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex" aria-label="Landing navigation">
            <a href="#features" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">Features</a>
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
        <section className="relative">
          <div aria-hidden className="paper-grid pointer-events-none absolute inset-0" />
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(ellipse, rgba(74,99,232,0.14), transparent 65%)" }} />
          <div className="relative mx-auto grid max-w-[1180px] items-center gap-14 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.02fr_1fr] lg:gap-10 lg:pb-24 lg:pt-20">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm">
                <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="size-2.5" />
                </span>
                The AI notes studio for self-learners
              </div>
              <h1 className="font-display mt-5 text-[42px] font-extrabold leading-[1.03] tracking-[-0.04em] sm:text-[58px] lg:text-[64px]">
                Turn any topic into{" "}
                <span className="brand-gradient-text">notes worth keeping.</span>
              </h1>
              <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-muted-foreground sm:text-base sm:leading-8">
                NoteForge teaches itself the subject first — mapping concepts, sequencing chapters, and writing deep explanations. Then it designs a beautifully structured study guide you can edit line by line and restyle in one click.
              </p>
              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <Button size="lg" asChild className="h-11 rounded-xl px-5 text-sm font-semibold shadow-sm">
                  <Link to={primaryHref}>
                    {primaryLabel}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-11 rounded-xl px-5 text-sm">
                  <a href="#themes">
                    See the themes
                    <ChevronRight className="ml-1.5 size-4" />
                  </a>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" /> No credit card</span>
                <span className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" /> 6 editorial themes</span>
                <span className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" /> Edit everything</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.97, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
              <LiveStudioDemo />
            </motion.div>
          </div>
        </section>

        {/* Proof strip */}
        <section className="border-y border-border/60 bg-card/50">
          <div className="mx-auto grid max-w-[1180px] grid-cols-2 divide-x divide-border/60 px-5 sm:grid-cols-4 sm:px-8">
            {[
              { value: "19", label: "visual block types" },
              { value: "6", label: "complete themes" },
              { value: "5-step", label: "teaching pipeline" },
              { value: "1", label: "topic to get started" },
            ].map((stat) => (
              <div key={stat.label} className="px-4 py-6 first:pl-0 sm:px-6">
                <p className="font-display text-2xl font-extrabold tracking-tight sm:text-[28px]">{stat.value}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-[1180px] scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24">
          <Reveal className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Not another summariser</p>
            <h2 className="font-display mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-[40px] sm:leading-[1.1]">
              It understands the subject before it writes a word.
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              A multi-step teaching pipeline maps the topic, sequences the learning path, then writes each chapter with the depth of a good textbook — not a pile of bullet points.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Reveal className="md:col-span-2" delay={0.05}>
              <div className="soft-card lift h-full rounded-[24px] p-6 sm:p-8">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Wand2 className="size-5" />
                </div>
                <h3 className="font-display mt-4 text-xl font-bold tracking-tight">A teaching pipeline, not one giant prompt</h3>
                <p className="mt-2 max-w-lg text-[13px] leading-6 text-muted-foreground">
                  Each stage has one job. That is why the result stays coherent across five or six chapters — and why it keeps the technical terms that matter.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {["Read & understand", "Map concepts", "Structure", "Teach in depth", "Design layouts"].map((stage, index) => (
                    <span key={stage} className="flex items-center gap-2">
                      <span className="rounded-full border border-border/80 bg-background px-3 py-1.5 text-[11px] font-medium">{stage}</span>
                      {index < 4 && <ChevronRight className="size-3 text-muted-foreground/40" />}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="soft-card lift flex h-full flex-col rounded-[24px] p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Layers className="size-5" />
                </div>
                <h3 className="font-display mt-4 text-lg font-bold tracking-tight">Nineteen ways to explain</h3>
                <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">Definitions, formulas, worked problems, timelines, comparisons, flowcharts and more.</p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                  {["Definition", "Formula", "Flowchart", "Solved problem", "Quiz", "Glossary", "Timeline"].map((tag) => (
                    <span key={tag} className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="soft-card lift flex h-full flex-col rounded-[24px] p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Palette className="size-5" />
                </div>
                <h3 className="font-display mt-4 text-lg font-bold tracking-tight">Restyle without rewriting</h3>
                <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">Six complete identities — from focused midnight to print-ready ivory. Switch whenever the mood changes.</p>
                <div className="mt-auto flex gap-1.5 pt-5">
                  {NOTE_THEMES.map((theme) => (
                    <span key={theme.id} className="size-7 rounded-lg border border-black/5" style={{ background: `linear-gradient(135deg, ${theme.swatch[0]} 0%, ${theme.swatch[1]} 55%, ${theme.swatch[2]} 100%)` }} title={theme.name} />
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal className="md:col-span-2" delay={0.1}>
              <div className="soft-card lift h-full rounded-[24px] p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <PenLine className="size-5" />
                    </div>
                    <h3 className="font-display mt-4 text-xl font-bold tracking-tight">Your notes, not a locked artifact</h3>
                    <p className="mt-2 max-w-md text-[13px] leading-6 text-muted-foreground">
                      Edit any sentence inline. Drag sections into a better order. Add a definition, duplicate a solved problem, undo it all. Changes save themselves.
                    </p>
                  </div>
                  <div className="w-full max-w-[280px] rounded-xl border border-border/80 bg-background p-3.5 shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground">
                      <GripVertical className="size-3" /> Chapter 02
                      <span className="ml-auto flex gap-1">
                        <span className="rounded border border-border px-1 py-0.5 text-[8px]">Undo</span>
                        <span className="rounded border border-border px-1 py-0.5 text-[8px]">Redo</span>
                      </span>
                    </div>
                    <p className="mt-2.5 text-[12px] font-semibold leading-5">
                      Backpropagation is just the chain rule, applied efficiently.
                      <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-primary align-middle" />
                    </p>
                    <div className="mt-2 space-y-1.5">
                      <div className="h-1.5 w-full rounded bg-muted" />
                      <div className="h-1.5 w-4/5 rounded bg-muted" />
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[9px] text-primary">
                      <Plus className="size-2.5" /> Add block
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Themes */}
        <section id="themes" className="scroll-mt-20 border-y border-border/60 bg-card/40 py-20 sm:py-24">
          <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
            <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Designed to be read</p>
                <h2 className="font-display mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-[40px] sm:leading-[1.1]">
                  One guide. Six completely different looks.
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Switch the theme at any moment. Typography, callout colours, cards and formula styling all move together — your content stays exactly where you left it.
                </p>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1.5 text-[10px] font-medium text-muted-foreground sm:flex">
                <PenLine className="size-3" /> Live preview
              </span>
            </Reveal>
            <div className="mt-8">
              <ThemePreview />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-[1180px] scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24">
          <Reveal className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">How it works</p>
            <h2 className="font-display mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-[40px] sm:leading-[1.1]">
              From one sentence to a study session.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {[
              {
                n: "01",
                title: "Name the topic",
                body: "Type anything — a concept, a chapter, an exam unit. Add a custom instruction if you want a particular angle.",
              },
              {
                n: "02",
                title: "Let it teach itself",
                body: "The AI maps the subject, sequences chapters, then writes detailed explanations with examples, diagrams and practice.",
              },
              {
                n: "03",
                title: "Edit, then restyle",
                body: "Rewrite any line, reorder blocks, insert formulas, and switch between six themes until it feels right.",
              },
            ].map((step, index) => (
              <Reveal key={step.n} delay={index * 0.08}>
                <div className="relative h-full rounded-2xl border border-border/70 bg-card p-6">
                  <span className="font-mono text-[10px] font-bold text-primary">{step.n}</span>
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
            <div className="relative overflow-hidden rounded-[28px] border border-foreground/10 px-6 py-14 text-center sm:px-12" style={{ background: "linear-gradient(135deg, #10131c 0%, #1b2440 55%, #113c3b 100%)" }}>
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(120,150,255,0.35), transparent 40%), radial-gradient(circle at 80% 70%, rgba(70,220,200,0.22), transparent 40%)" }} />
              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9fb2ff]">Start with one sentence</p>
                <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-[42px]">
                  Your best study session is one topic away.
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/60">
                  Turn the thing you keep meaning to understand into notes you will actually revisit.
                </p>
                <Button size="lg" asChild className="mt-7 h-11 rounded-xl bg-white px-6 text-sm font-semibold text-[#111420] hover:bg-white/90">
                  <Link to={primaryHref}>
                    {primaryLabel}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-[11px] text-muted-foreground">Notes for the curious.</span>
          </div>
          <div className="flex items-center gap-5 text-[11px] text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#themes" className="transition-colors hover:text-foreground">Themes</a>
            <Link to={primaryHref} className="transition-colors hover:text-foreground">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
