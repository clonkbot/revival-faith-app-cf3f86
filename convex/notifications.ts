import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) => q.eq("userId", userId).eq("isRead", false))
      .collect();

    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) => q.eq("userId", userId).eq("isRead", false))
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

export const createForUser = mutation({
  args: {
    message: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("notifications", {
      userId,
      message: args.message,
      type: args.type,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

// Internal mutation for creating notifications for all users
export const createPrayerReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all users who have prayer intentions
    const allPrayers = await ctx.db.query("prayerIntentions").collect();
    const userIds = [...new Set(allPrayers.map(p => p.userId))];

    const messages = [
      "Take a moment to pray. Your faith journey continues.",
      "Remember: Every prayer is heard. Keep the faith.",
      "A minute of prayer can change your whole day.",
      "The Lord is near to all who call on Him.",
      "Your prayers matter. Don't give up.",
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    for (const userId of userIds) {
      await ctx.db.insert("notifications", {
        userId,
        message: randomMessage,
        type: "prayer_reminder",
        isRead: false,
        createdAt: Date.now(),
      });
    }
  },
});
