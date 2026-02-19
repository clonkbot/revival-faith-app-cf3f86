import { query, mutation, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("faithResources")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .take(20);
    }
    return await ctx.db
      .query("faithResources")
      .order("desc")
      .take(20);
  },
});

export const getLatestScrapeJob = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("scrapeJobs")
      .order("desc")
      .first();
    return jobs;
  },
});

export const addResource = internalMutation({
  args: {
    title: v.string(),
    url: v.string(),
    description: v.string(),
    source: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if URL already exists
    const existing = await ctx.db
      .query("faithResources")
      .filter((q) => q.eq(q.field("url"), args.url))
      .first();

    if (!existing) {
      await ctx.db.insert("faithResources", {
        ...args,
        scrapedAt: Date.now(),
      });
    }
  },
});

export const createScrapeJob = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.insert("scrapeJobs", {
      status: "pending",
      itemsScraped: 0,
    });
  },
});

export const updateScrapeJob = internalMutation({
  args: {
    jobId: v.id("scrapeJobs"),
    status: v.string(),
    itemsScraped: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status };

    if (args.status === "running") {
      updates.startedAt = Date.now();
    }
    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }
    if (args.itemsScraped !== undefined) {
      updates.itemsScraped = args.itemsScraped;
    }
    if (args.error) {
      updates.error = args.error;
    }

    await ctx.db.patch(args.jobId, updates);
  },
});

// Action to scrape faith resources using Firecrawl
export const scrapeResources = action({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    // Create a scrape job
    const jobId = await ctx.runMutation(internal.resources.createScrapeJob, {});

    await ctx.runMutation(internal.resources.updateScrapeJob, {
      jobId,
      status: "running",
    });

    try {
      // URLs to scrape for faith-related content
      const urls = [
        "https://www.christianitytoday.com/",
        "https://www.relevantmagazine.com/",
        "https://www.desiringgod.org/",
      ];

      let totalScraped = 0;

      for (const url of urls) {
        try {
          // Use Firecrawl API to scrape
          const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${args.apiKey}`,
            },
            body: JSON.stringify({
              url,
              formats: ["markdown"],
            }),
          });

          if (response.ok) {
            const data = await response.json();

            if (data.success && data.data) {
              const title = data.data.metadata?.title || "Faith Resource";
              const description = data.data.metadata?.description || data.data.markdown?.substring(0, 200) || "Discover faith resources and inspiration.";

              await ctx.runMutation(internal.resources.addResource, {
                title,
                url,
                description,
                source: new URL(url).hostname,
                category: "inspiration",
              });

              totalScraped++;
            }
          }
        } catch (error) {
          console.error(`Failed to scrape ${url}:`, error);
        }
      }

      await ctx.runMutation(internal.resources.updateScrapeJob, {
        jobId,
        status: "completed",
        itemsScraped: totalScraped,
      });

      return { success: true, itemsScraped: totalScraped };
    } catch (error) {
      await ctx.runMutation(internal.resources.updateScrapeJob, {
        jobId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});

// Manual resource addition for demo purposes
export const addManualResource = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    description: v.string(),
    source: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("faithResources", {
      ...args,
      scrapedAt: Date.now(),
    });
  },
});
