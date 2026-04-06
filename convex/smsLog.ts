import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const logSms = mutation({
  args: {
    gigId: v.optional(v.id("gigs")),
    recipientIds: v.array(v.id("talentProfiles")),
    recipientCount: v.number(),
    message: v.string(),
    channel: v.string(),
  },
  returns: v.id("smsLog"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("smsLog", {
      ...args,
      sentBy: userId,
    });
  },
});

export const logSmsSentInternal = internalMutation({
  args: {
    recipientCount: v.number(),
    sent: v.number(),
    failed: v.number(),
    message: v.string(),
    gigTitle: v.optional(v.string()),
    channel: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("smsLog", {
      recipientCount: args.recipientCount,
      message: args.message,
      channel: args.channel,
      sent: args.sent,
      failed: args.failed,
      gigTitle: args.gigTitle,
    });
    return null;
  },
});

export const getGigSmsHistory = query({
  args: { gigId: v.id("gigs") },
  returns: v.array(v.object({
    _id: v.id("smsLog"),
    _creationTime: v.number(),
    recipientCount: v.number(),
    message: v.string(),
    channel: v.string(),
  })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const logs = await ctx.db.query("smsLog").collect();
    return logs
      .filter((l: any) => l.gigId === args.gigId)
      .map((l: any) => ({
        _id: l._id,
        _creationTime: l._creationTime,
        recipientCount: l.recipientCount,
        message: l.message,
        channel: l.channel,
      }));
  },
});