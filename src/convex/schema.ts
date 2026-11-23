import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";
import { noteBlockValidator, notesMetaValidator, settingsValidator } from "./noteBlocks";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // users table (kept compatible with the app's existing user fields)
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),

      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    noteProjects: defineTable({
      userId: v.id("users"),
      title: v.string(),
      topic: v.string(),
      status: v.union(
        v.literal("queued"),
        v.literal("generating"),
        v.literal("ready"),
        v.literal("error"),
      ),
      stage: v.string(),
      stageDetail: v.optional(v.string()),
      progress: v.number(),
      theme: v.string(),
      settings: settingsValidator,
      notes: v.optional(notesMetaValidator),
      sourceMaterial: v.optional(v.string()),
      sourceLabel: v.optional(v.string()),
      blocks: v.array(noteBlockValidator),
      outline: v.optional(v.any()),
      warnings: v.optional(v.array(v.string())),
      error: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_updated", ["userId", "updatedAt"]),

    admins: defineTable({
      email: v.string(),
      hash: v.string(),
      salt: v.string(),
      createdAt: v.number(),
    })
      .index("by_email", ["email"]),

    adminSessions: defineTable({
      adminId: v.id("admins"),
      token: v.string(),
      expiresAt: v.number(),
    })
      .index("by_token", ["token"])
      .index("by_admin", ["adminId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
