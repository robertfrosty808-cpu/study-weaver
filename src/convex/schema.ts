import { authTables } from "@convex-dev/auth/server";
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
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

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
  },
  {
    schemaValidation: false,
  },
);

export default schema;
