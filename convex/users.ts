import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      role: v.optional(v.string()),
      image: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    };
  },
});

export const setRole = mutation({
  args: {
    role: v.string(),
    adminCode: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (args.role === "admin") {
      if (args.adminCode !== "DIAMOND2024") {
        throw new Error("Invalid admin code");
      }
    }

    if (!["admin", "client", "talent"].includes(args.role)) {
      throw new Error("Invalid role");
    }

    await ctx.db.patch(user._id, { role: args.role });

    // Seed demo gigs when a client registers
    if (args.role === "client") {
      await ctx.scheduler.runAfter(0, internal.gigs.seedDemoGigs, { userId: user._id });
    }

    return null;
  },
});