import { query, mutation, internalMutation } from "./_generated/server";
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
      if (args.adminCode !== "2025") {
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

export const checkAndLinkOnboardedTalent = mutation({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const user = await ctx.db.get(userId);
    if (!user) return false;

    // Already has a role — nothing to link
    if (user.role) return false;

    // Need an email to match
    if (!user.email) return false;

    // Look for an existing user record created via onboarding with the same email
    const onboardedUsers = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", user.email!))
      .collect();

    // Find one that has role "talent" and is NOT the current auth user
    const onboardedUser = onboardedUsers.find(
      (u) => u._id !== userId && u.role === "talent"
    );

    if (!onboardedUser) return false;

    // Found a match! Transfer the talent profile to the auth user
    const talentProfile = await ctx.db
      .query("talentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", onboardedUser._id))
      .first();

    if (talentProfile) {
      // Re-link the talent profile to the auth user
      await ctx.db.patch(talentProfile._id, { userId });
    }

    // Set the auth user's role to talent
    await ctx.db.patch(userId, {
      role: "talent",
      name: onboardedUser.name || user.name,
    });

    // Delete the orphaned onboarding user record
    await ctx.db.delete(onboardedUser._id);

    return true;
  },
});

export const setupAdmin = internalMutation({
  args: { email: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .collect();
    let count = 0;
    for (const user of users) {
      await ctx.db.patch(user._id, { role: "admin" });
      count++;
    }
    return count;
  },
});

export const cleanupOrphanedDevUser = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .withIndex("email", (q: any) => q.eq("email", "leboggg@gmail.com"))
      .collect();

    let deletedAccounts = 0;
    let deletedSessions = 0;
    let deletedUsers = 0;

    for (const user of users) {
      // Delete all authAccounts linked to this user
      const accounts = await ctx.db.query("authAccounts").collect();
      for (const acc of accounts) {
        if ((acc as any).userId?.toString() === user._id.toString()) {
          await ctx.db.delete(acc._id);
          deletedAccounts++;
        }
      }
      // Delete all sessions for this user
      const sessions = await ctx.db.query("authSessions").collect();
      for (const s of sessions) {
        if ((s as any).userId?.toString() === user._id.toString()) {
          await ctx.db.delete(s._id);
          deletedSessions++;
        }
      }
      // Delete the user
      await ctx.db.delete(user._id);
      deletedUsers++;
    }

    return `Deleted ${deletedUsers} users, ${deletedAccounts} auth accounts, ${deletedSessions} sessions`;
  },
});