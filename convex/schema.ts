import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  skills: defineTable({
   title: v.string(),
   icon: v.optional(v.string())
  }),
  subSkills: defineTable({
    title: v.string(),
    icon: v.optional(v.string())
  }),
  messages: defineTable({
    name: v.string(),
    email: v.string(),
    messageContent: v.string()
  })
  
});

