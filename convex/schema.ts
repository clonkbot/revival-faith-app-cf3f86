import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // User prayer intentions and church visits
  prayerIntentions: defineTable({
    userId: v.id("users"),
    intention: v.string(),
    category: v.string(), // "healing", "gratitude", "guidance", "family", "world", "other"
    isAnswered: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_category", ["category"]),

  // Church visit logs
  churchVisits: defineTable({
    userId: v.id("users"),
    churchName: v.string(),
    visitDate: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Scraped articles and resources about faith
  faithResources: defineTable({
    title: v.string(),
    url: v.string(),
    description: v.string(),
    source: v.string(),
    scrapedAt: v.number(),
    category: v.string(), // "news", "inspiration", "events", "testimonies"
  }).index("by_category", ["category"])
    .index("by_scraped_at", ["scrapedAt"]),

  // User notifications
  notifications: defineTable({
    userId: v.id("users"),
    message: v.string(),
    type: v.string(), // "prayer_reminder", "church_reminder", "resource_update"
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "isRead"]),

  // Scraping jobs status
  scrapeJobs: defineTable({
    status: v.string(), // "pending", "running", "completed", "failed"
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    itemsScraped: v.number(),
    error: v.optional(v.string()),
  }).index("by_status", ["status"]),
});
