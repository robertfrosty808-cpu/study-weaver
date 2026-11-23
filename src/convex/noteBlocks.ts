import { v } from "convex/values";

/** Shared validators for the notes document stored in Convex. */
export const noteBlockValidator = v.object({
  id: v.string(),
  type: v.string(),
  title: v.optional(v.string()),
  subtitle: v.optional(v.string()),
  text: v.optional(v.string()),
  badge: v.optional(v.string()),
  items: v.optional(v.array(v.string())),
  pros: v.optional(v.array(v.string())),
  cons: v.optional(v.array(v.string())),
  headers: v.optional(v.array(v.string())),
  rows: v.optional(v.array(v.array(v.string()))),
  code: v.optional(v.string()),
  language: v.optional(v.string()),
  formula: v.optional(v.string()),
  steps: v.optional(v.array(v.object({ title: v.string(), detail: v.string() }))),
  pairs: v.optional(v.array(v.object({ front: v.string(), back: v.string() }))),
  terms: v.optional(v.array(v.object({ term: v.string(), definition: v.string() }))),
  mermaid: v.optional(v.string()),
  tone: v.optional(v.string()),
  source: v.optional(v.string()),
  pageRef: v.optional(v.string()),
});

export const settingsValidator = v.object({
  detail: v.string(),
  language: v.string(),
  audience: v.string(),
  mode: v.union(v.literal("exam"), v.literal("concept")),
  diagrams: v.boolean(),
  examples: v.boolean(),
  practice: v.boolean(),
  customInstruction: v.string(),
});

export const notesMetaValidator = v.object({
  title: v.string(),
  subtitle: v.string(),
  subject: v.string(),
});
