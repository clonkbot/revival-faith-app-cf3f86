import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("churchVisits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { total: 0, thisMonth: 0 };

    const visits = await ctx.db
      .query("churchVisits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return {
      total: visits.length,
      thisMonth: visits.filter(v => v.visitDate >= startOfMonth).length,
    };
  },
});

export const create = mutation({
  args: {
    churchName: v.string(),
    visitDate: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("churchVisits", {
      userId,
      churchName: args.churchName,
      visitDate: args.visitDate,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("churchVisits") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const visit = await ctx.db.get(args.id);
    if (!visit || visit.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
