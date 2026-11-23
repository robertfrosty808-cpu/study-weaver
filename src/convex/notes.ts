import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { noteBlockValidator, notesMetaValidator, settingsValidator } from "./noteBlocks";

async function requireUserId(ctx: Parameters<typeof getAuthUserId>[0]) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("Please sign in to continue.");
  }
  return userId;
}

function titleFromTopic(topic: string) {
  const clean = topic.trim().replace(/\s+/g, " ");
  const short = clean.length > 88 ? `${clean.slice(0, 85).trimEnd()}…` : clean;
  return short.charAt(0).toUpperCase() + short.slice(1);
}

/** Recent projects for the dashboard. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const rows = await ctx.db
      .query("noteProjects")
      .withIndex("by_user_updated", (q) => q.eq("userId", userId))
      .order("desc")
      .take(60);

    return rows.map((row) => ({
      _id: row._id,
      title: row.title,
      topic: row.topic,
      status: row.status,
      stage: row.stage,
      progress: row.progress,
      theme: row.theme,
      subtitle: row.notes?.subtitle,
      subject: row.notes?.subject,
      hasSource: Boolean(row.sourceMaterial),
      sourceLabel: row.sourceLabel,
      blockCount: row.blocks.length,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  },
});

/** A single project, including the live notes document. */
export const get = query({
  args: { id: v.id("noteProjects") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) return null;
    return project;
  },
});

/** Create an empty project that the generation action will fill in. */
export const create = mutation({
  args: {
    topic: v.string(),
    settings: settingsValidator,
    theme: v.string(),
    sourceMaterial: v.optional(v.string()),
    sourceLabel: v.optional(v.string()),
  },
  handler: async (ctx, { topic, settings, theme, sourceMaterial, sourceLabel }) => {
    const userId = await requireUserId(ctx);
    const clean = topic.trim();
    if (clean.length < 2) {
      throw new ConvexError("Add a topic with at least a couple of words.");
    }
    const now = Date.now();
    return await ctx.db.insert("noteProjects", {
      userId,
      title: titleFromTopic(clean),
      topic: clean,
      status: "queued",
      stage: "reading",
      stageDetail: "Preparing your notes",
      progress: 3,
      theme,
      settings,
      notes: { title: titleFromTopic(clean), subtitle: "", subject: "" },
      sourceMaterial: sourceMaterial?.trim() ? sourceMaterial.trim().slice(0, 30000) : undefined,
      sourceLabel: sourceMaterial?.trim() ? sourceLabel?.trim().slice(0, 160) : undefined,
      blocks: [],
      warnings: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Save a fully built document (used by the example notes shortcut). */
export const createSample = mutation({
  args: {
    title: v.string(),
    subtitle: v.string(),
    subject: v.string(),
    blocks: v.array(noteBlockValidator),
    theme: v.string(),
    settings: settingsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    return await ctx.db.insert("noteProjects", {
      userId,
      title: args.title,
      topic: args.subject || args.title,
      status: "ready",
      stage: "done",
      stageDetail: "Example notes",
      progress: 100,
      theme: args.theme,
      settings: args.settings,
      notes: { title: args.title, subtitle: args.subtitle, subject: args.subject },
      blocks: args.blocks,
      warnings: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateBlocks = mutation({
  args: {
    id: v.id("noteProjects"),
    blocks: v.array(noteBlockValidator),
  },
  handler: async (ctx, { id, blocks }) => {
    const userId = await requireUserId(ctx);
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) {
      throw new ConvexError("Those notes are not available.");
    }
    await ctx.db.patch(id, { blocks, updatedAt: Date.now() });
    return true;
  },
});

export const updateTheme = mutation({
  args: { id: v.id("noteProjects"), theme: v.string() },
  handler: async (ctx, { id, theme }) => {
    const userId = await requireUserId(ctx);
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) return false;
    await ctx.db.patch(id, { theme, updatedAt: Date.now() });
    return true;
  },
});

export const rename = mutation({
  args: { id: v.id("noteProjects"), title: v.string() },
  handler: async (ctx, { id, title }) => {
    const userId = await requireUserId(ctx);
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) return false;
    const clean = title.trim().slice(0, 120) || project.title;
    await ctx.db.patch(id, {
      title: clean,
      notes: {
        title: clean,
        subtitle: project.notes?.subtitle ?? "",
        subject: project.notes?.subject ?? "",
      },
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const remove = mutation({
  args: { id: v.id("noteProjects") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) return false;
    await ctx.db.delete(id);
    return true;
  },
});

/* ------------------------------------------------------------------ */
/* Internal helpers used by the generation action                      */
/* ------------------------------------------------------------------ */

export const getOwned = internalQuery({
  args: { id: v.id("noteProjects"), userId: v.id("users") },
  handler: async (ctx, { id, userId }) => {
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) return null;
    return project;
  },
});

/**
 * Atomically claim a project for generation. Prevents duplicate pipelines if a
 * double click, a StrictMode remount or a retry races another invocation.
 */
export const claimGeneration = internalMutation({
  args: { id: v.id("noteProjects") },
  handler: async (ctx, { id }) => {
    const project = await ctx.db.get(id);
    if (!project) return false;
    if (project.status !== "queued" && project.status !== "error") return false;
    await ctx.db.patch(id, {
      status: "generating",
      stage: "reading",
      stageDetail: "Reading and scoping your topic",
      progress: 4,
      error: undefined,
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const patch = internalMutation({
  args: {
    id: v.id("noteProjects"),
    status: v.optional(
      v.union(
        v.literal("queued"),
        v.literal("generating"),
        v.literal("ready"),
        v.literal("error"),
      ),
    ),
    stage: v.optional(v.string()),
    stageDetail: v.optional(v.string()),
    progress: v.optional(v.number()),
    error: v.optional(v.string()),
    notes: v.optional(notesMetaValidator),
    blocks: v.optional(v.array(noteBlockValidator)),
    appendBlocks: v.optional(v.array(noteBlockValidator)),
    warnings: v.optional(v.array(v.string())),
    outline: v.optional(v.any()),
  },
  handler: async (ctx, { id, appendBlocks, ...patch }) => {
    const project = await ctx.db.get(id);
    if (!project) return false;
    const nextBlocks = appendBlocks
      ? [...project.blocks, ...appendBlocks]
      : undefined;
    await ctx.db.patch(id, {
      ...patch,
      ...(nextBlocks ? { blocks: nextBlocks } : {}),
      updatedAt: Date.now(),
    });
    return true;
  },
});
