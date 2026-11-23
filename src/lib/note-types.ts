export const BLOCK_TYPES = [
  "hero",
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
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export type CalloutTone = "important" | "warning" | "examTip" | "insight";

export interface NoteBlock {
  id: string;
  type: BlockType;
  title?: string;
  subtitle?: string;
  text?: string;
  badge?: string;
  items?: string[];
  pros?: string[];
  cons?: string[];
  headers?: string[];
  rows?: string[][];
  code?: string;
  language?: string;
  formula?: string;
  steps?: { title: string; detail: string }[];
  pairs?: { front: string; back: string }[];
  terms?: { term: string; definition: string }[];
  mermaid?: string;
  tone?: CalloutTone;
  source?: "source" | "ai";
  pageRef?: string;
}

export interface NoteNotes {
  title: string;
  subtitle: string;
  subject: string;
}

export interface NoteSettings {
  detail: DetailLevel;
  language: string;
  audience: string;
  mode: "exam" | "concept";
  diagrams: boolean;
  examples: boolean;
  practice: boolean;
  customInstruction: string;
}

export const DETAIL_LEVELS = [
  {
    id: "standard",
    label: "Standard",
    description: "A focused set of core ideas. Good for a quick refresher.",
    chapters: 3,
  },
  {
    id: "detailed",
    label: "Detailed",
    description: "Full explanations with examples and a few diagrams.",
    chapters: 4,
  },
  {
    id: "very-detailed",
    label: "Very detailed",
    description: "A complete study guide: every subtopic, worked examples, and exam questions.",
    chapters: 5,
  },
  {
    id: "comprehensive",
    label: "Comprehensive",
    description: "Everything, at textbook depth. Best for mastering a subject from scratch.",
    chapters: 6,
  },
] as const;

export type DetailLevel = (typeof DETAIL_LEVELS)[number]["id"];

export const AUDIENCES = [
  "University student",
  "High school student",
  "Exam candidate",
  "Working professional",
  "Curious self-learner",
  "Complete beginner",
] as const;

export const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Hindi",
  "Portuguese",
  "Arabic",
  "Simplified Chinese",
  "Japanese",
] as const;

export const DEFAULT_SETTINGS: NoteSettings = {
  detail: "very-detailed",
  language: "English",
  audience: "University student",
  mode: "concept",
  diagrams: true,
  examples: true,
  practice: true,
  customInstruction: "",
};

export interface NoteTheme {
  id: string;
  name: string;
  blurb: string;
  className: string;
  swatch: [string, string, string];
  dark: boolean;
}

export const NOTE_THEMES: NoteTheme[] = [
  {
    id: "midnight",
    name: "Midnight",
    blurb: "Deep, focused dark",
    className: "notes-midnight",
    swatch: ["#0d0f15", "#171a24", "#93a5ff"],
    dark: true,
  },
  {
    id: "ivory",
    name: "Ivory",
    blurb: "Clean light, print-ready",
    className: "notes-ivory",
    swatch: ["#faf6ee", "#fffdf8", "#9a5a26"],
    dark: false,
  },
  {
    id: "ocean",
    name: "Ocean",
    blurb: "Cool and calm",
    className: "notes-ocean",
    swatch: ["#061923", "#0b2535", "#58c7ee"],
    dark: true,
  },
  {
    id: "sunset",
    name: "Sunset",
    blurb: "Warm and editorial",
    className: "notes-sunset",
    swatch: ["#1d1218", "#2a1a23", "#fb9a4b"],
    dark: true,
  },
  {
    id: "mono",
    name: "Mono",
    blurb: "Ink on paper",
    className: "notes-mono",
    swatch: ["#ffffff", "#f5f5f2", "#1c1c1c"],
    dark: false,
  },
  {
    id: "neon",
    name: "Neon",
    blurb: "High-contrast energy",
    className: "notes-neon",
    swatch: ["#090913", "#131126", "#b49bff"],
    dark: true,
  },
];

export function themeById(id: string | undefined): NoteTheme {
  return NOTE_THEMES.find((theme) => theme.id === id) ?? NOTE_THEMES[0];
}

export interface ProjectSummary {
  _id: string;
  title: string;
  topic: string;
  status: "queued" | "generating" | "ready" | "error";
  stage: string;
  progress: number;
  theme: string;
  subtitle?: string;
  subject?: string;
  hasSource?: boolean;
  sourceLabel?: string;
  blockCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectDetail extends ProjectSummary {
  blocks: NoteBlock[];
  notes?: NoteNotes;
  settings: NoteSettings;
  stageDetail?: string;
  error?: string;
  warnings?: string[];
}

export const GEN_STEPS = [
  { id: "reading", label: "Reading", blurb: "Reading your material or scoping the topic" },
  { id: "understanding", label: "Understanding", blurb: "Mapping concepts, terms and relationships" },
  { id: "structuring", label: "Structuring", blurb: "Designing chapters and the learning path" },
  { id: "writing", label: "Writing", blurb: "Teaching each chapter in depth" },
  { id: "designing", label: "Designing", blurb: "Assigning layouts, diagrams and takeaways" },
] as const;

export const BLOCK_LIBRARY: {
  type: BlockType;
  label: string;
  description: string;
}[] = [
  { type: "chapterHeader", label: "Chapter header", description: "A numbered chapter opener" },
  { type: "paragraph", label: "Rich paragraph", description: "Long-form explanation" },
  { type: "bulletList", label: "Bullet list", description: "Scannable key points" },
  { type: "definition", label: "Definition card", description: "Key term and its meaning" },
  { type: "formula", label: "Formula", description: "Rendered with KaTeX" },
  { type: "example", label: "Example card", description: "A real-world illustration" },
  { type: "callout", label: "Callout", description: "Important, warning or exam tip" },
  { type: "prosCons", label: "Advantages vs disadvantages", description: "Two balanced columns" },
  { type: "comparisonTable", label: "Comparison table", description: "Side-by-side contrast" },
  { type: "flowchart", label: "Flowchart", description: "A process drawn with Mermaid" },
  { type: "steps", label: "Step-by-step", description: "A numbered timeline" },
  { type: "tree", label: "Classification tree", description: "A hierarchy drawn with Mermaid" },
  { type: "code", label: "Code block", description: "Syntax-highlighted snippet" },
  { type: "solvedProblem", label: "Solved problem", description: "Question, then worked steps" },
  { type: "flashcards", label: "Flashcards", description: "Front/back study pairs" },
  { type: "glossary", label: "Glossary", description: "Key terms and meanings" },
  { type: "takeaways", label: "Key takeaways", description: "A chapter recap card" },
  { type: "quiz", label: "Quick quiz", description: "Questions with revealable answers" },
];

export function makeBlock(type: BlockType): NoteBlock {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  switch (type) {
    case "chapterHeader":
      return { id, type, title: "New chapter", text: "What this chapter covers.", badge: "01" };
    case "paragraph":
      return { id, type, text: "Write your explanation here. Keep it clear, specific and useful." };
    case "bulletList":
      return { id, type, title: "Key points", items: ["First point", "Second point", "Third point"] };
    case "definition":
      return { id, type, title: "Term", text: "Define the term in one or two precise sentences." };
    case "formula":
      return { id, type, title: "Formula", formula: "E = mc^2", text: "What each symbol means." };
    case "example":
      return { id, type, title: "Example", text: "A concrete situation that makes the idea click." };
    case "callout":
      return { id, type, tone: "important", title: "Important", text: "The thing worth remembering." };
    case "prosCons":
      return { id, type, title: "Advantages & disadvantages", pros: ["First advantage"], cons: ["First drawback"] };
    case "comparisonTable":
      return {
        id,
        type,
        title: "Comparison",
        headers: ["Aspect", "Option A", "Option B"],
        rows: [["Definition", "", ""]],
      };
    case "flowchart":
      return {
        id,
        type,
        title: "Process flow",
        mermaid: "flowchart TD\n  A[Start] --> B[Next step]\n  B --> C[Finish]",
      };
    case "steps":
      return { id, type, title: "Step by step", steps: [{ title: "Step one", detail: "What happens here." }] };
    case "tree":
      return {
        id,
        type,
        title: "Classification",
        mermaid: "flowchart TD\n  A[Parent] --> B[Branch one]\n  A --> C[Branch two]",
      };
    case "code":
      return { id, type, title: "Code", language: "python", code: "print('Hello, world!')" };
    case "solvedProblem":
      return {
        id,
        type,
        title: "Solved problem",
        text: "The problem statement.",
        steps: [{ title: "Reasoning", detail: "How to approach it." }],
      };
    case "flashcards":
      return { id, type, title: "Flashcards", pairs: [{ front: "Question", back: "Answer" }] };
    case "glossary":
      return { id, type, title: "Key terms", terms: [{ term: "Term", definition: "Meaning" }] };
    case "takeaways":
      return { id, type, title: "Key takeaways", items: ["The one thing to remember"] };
    case "quiz":
      return {
        id,
        type,
        title: "Quick quiz",
        pairs: [{ front: "Question?", back: "Answer." }],
      };
    default:
      return { id, type: "paragraph", text: "" };
  }
}
