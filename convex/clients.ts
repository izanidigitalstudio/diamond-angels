import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyClientProfile = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("clientProfiles"),
      companyName: v.string(),
      registrationNumber: v.optional(v.string()),
      vatNumber: v.optional(v.string()),
      industry: v.optional(v.string()),
      website: v.optional(v.string()),
      contactPerson: v.string(),
      jobTitle: v.optional(v.string()),
      phone: v.string(),
      altPhone: v.optional(v.string()),
      email: v.string(),
      streetAddress: v.optional(v.string()),
      city: v.optional(v.string()),
      stateProvince: v.optional(v.string()),
      postalCode: v.optional(v.string()),
      country: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profiles = await ctx.db
      .query("clientProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .take(1);
    if (profiles.length === 0) return null;

    const p = profiles[0];
    return {
      _id: p._id,
      companyName: p.companyName,
      registrationNumber: p.registrationNumber,
      vatNumber: p.vatNumber,
      industry: p.industry,
      website: p.website,
      contactPerson: p.contactPerson,
      jobTitle: p.jobTitle,
      phone: p.phone,
      altPhone: p.altPhone,
      email: p.email,
      streetAddress: p.streetAddress,
      city: p.city,
      stateProvince: p.stateProvince,
      postalCode: p.postalCode,
      country: p.country,
    };
  },
});

export const upsertClientProfile = mutation({
  args: {
    companyName: v.string(),
    registrationNumber: v.optional(v.string()),
    vatNumber: v.optional(v.string()),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    contactPerson: v.string(),
    jobTitle: v.optional(v.string()),
    phone: v.string(),
    altPhone: v.optional(v.string()),
    email: v.string(),
    streetAddress: v.optional(v.string()),
    city: v.optional(v.string()),
    stateProvince: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "client") throw new Error("Only clients");

    const existing = await ctx.db
      .query("clientProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .take(1);

    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, args);
    } else {
      await ctx.db.insert("clientProfiles", {
        userId: user._id,
        ...args,
      });
    }
    return null;
  },
});