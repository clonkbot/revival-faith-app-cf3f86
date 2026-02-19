import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("prayerIntentions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { total: 0, answered: 0 };

    const prayers = await ctx.db
      .query("prayerIntentions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      total: prayers.length,
      answered: prayers.filter(p => p.isAnswered).length,
    };
  },
});

export const create = mutation({
  args: {
    intention: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("prayerIntentions", {
      userId,
      intention: args.intention,
      category: args.category,
      isAnswered: false,
      createdAt: Date.now(),
    });
  },
});

export const markAnswered = mutation({
  args: { id: v.id("prayerIntentions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const prayer = await ctx.db.get(args.id);
    if (!prayer || prayer.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, { isAnswered: true });
  },
});

export const remove = mutation({
  args: { id: v.id("prayerIntentions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const prayer = await ctx.db.get(args.id);
    if (!prayer || prayer.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
