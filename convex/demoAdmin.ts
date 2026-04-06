import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Public query - no auth required, for demo admin dashboard
async function resolvePhotoUrls(ctx: any, photos: any[]) {
  return Promise.all(photos.map((id: any) => ctx.storage.getUrl(id)));
}

function formatProfile(profile: any, photoUrls: (string | null)[]) {
  return {
    _id: profile._id,
    _creationTime: profile._creationTime,
    userId: profile.userId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    city: profile.city,
    area: profile.area,
    race: profile.race,
    bodyType: profile.bodyType,
    heightCm: profile.heightCm,
    bio: profile.bio,
    categories: profile.categories,
    photoUrls,
    instagram: profile.instagram,
    status: profile.status,
    declineReason: profile.declineReason,
    adminNotes: profile.adminNotes,
    email: profile.email,
    altPhone: profile.altPhone,
    workplace: profile.workplace,
    jobTitle: profile.jobTitle,
    tiktok: profile.tiktok,
    twitter: profile.twitter,
    facebook: profile.facebook,
    addressStreet: profile.addressStreet,
    addressCity: profile.addressCity,
    addressState: profile.addressState,
    addressPostalCode: profile.addressPostalCode,
    addressCountry: profile.addressCountry,
    nokFullName: profile.nokFullName,
    nokRelationship: profile.nokRelationship,
    nokPhone: profile.nokPhone,
    nokEmail: profile.nokEmail,
    nokAddress: profile.nokAddress,
  };
}

const profileReturn = v.object({
  _id: v.id("talentProfiles"),
  _creationTime: v.number(),
  userId: v.id("users"),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  phone: v.optional(v.string()),
  city: v.optional(v.string()),
  area: v.optional(v.string()),
  race: v.optional(v.string()),
  bodyType: v.optional(v.string()),
  heightCm: v.optional(v.number()),
  bio: v.optional(v.string()),
  categories: v.optional(v.array(v.string())),
  photoUrls: v.array(v.union(v.string(), v.null())),
  instagram: v.optional(v.string()),
  status: v.string(),
  declineReason: v.optional(v.string()),
  adminNotes: v.optional(v.string()),
  email: v.optional(v.string()),
  altPhone: v.optional(v.string()),
  workplace: v.optional(v.string()),
  jobTitle: v.optional(v.string()),
  tiktok: v.optional(v.string()),
  twitter: v.optional(v.string()),
  facebook: v.optional(v.string()),
  addressStreet: v.optional(v.string()),
  addressCity: v.optional(v.string()),
  addressState: v.optional(v.string()),
  addressPostalCode: v.optional(v.string()),
  addressCountry: v.optional(v.string()),
  nokFullName: v.optional(v.string()),
  nokRelationship: v.optional(v.string()),
  nokPhone: v.optional(v.string()),
  nokEmail: v.optional(v.string()),
  nokAddress: v.optional(v.string()),
});

export const listProfiles = query({
  args: { status: v.optional(v.string()) },
  returns: v.array(profileReturn),
  handler: async (ctx, args) => {
    let profiles;
    if (args.status) {
      profiles = await ctx.db
        .query("talentProfiles")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      profiles = await ctx.db.query("talentProfiles").order("desc").collect();
    }
    const results = [];
    for (const profile of profiles) {
      const photoUrls = await resolvePhotoUrls(ctx, profile.photos);
      results.push(formatProfile(profile, photoUrls));
    }
    return results;
  },
});

export const profileCounts = query({
  args: {},
  returns: v.object({
    pending: v.number(),
    approved: v.number(),
    declined: v.number(),
    archived: v.number(),
    total: v.number(),
  }),
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("talentProfiles")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const approved = await ctx.db
      .query("talentProfiles")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();
    const declined = await ctx.db
      .query("talentProfiles")
      .withIndex("by_status", (q) => q.eq("status", "declined"))
      .collect();
    const archived = await ctx.db
      .query("talentProfiles")
      .withIndex("by_status", (q) => q.eq("status", "archived"))
      .collect();
    return {
      pending: pending.length,
      approved: approved.length,
      declined: declined.length,
      archived: archived.length,
      total: pending.length + approved.length + declined.length + archived.length,
    };
  },
});

export const approveProfile = mutation({
  args: {
    profileId: v.id("talentProfiles"),
    feedback: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updates: any = { status: "approved" };
    if (args.feedback) updates.adminNotes = args.feedback;
    await ctx.db.patch(args.profileId, updates);
    return null;
  },
});

export const declineProfile = mutation({
  args: {
    profileId: v.id("talentProfiles"),
    reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      status: "declined",
      declineReason: args.reason,
    });
    return null;
  },
});

export const updateProfile = mutation({
  args: {
    profileId: v.id("talentProfiles"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    area: v.optional(v.string()),
    race: v.optional(v.string()),
    bodyType: v.optional(v.string()),
    heightCm: v.optional(v.number()),
    bio: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    instagram: v.optional(v.string()),
    email: v.optional(v.string()),
    altPhone: v.optional(v.string()),
    workplace: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    twitter: v.optional(v.string()),
    facebook: v.optional(v.string()),
    addressStreet: v.optional(v.string()),
    addressCity: v.optional(v.string()),
    addressState: v.optional(v.string()),
    addressPostalCode: v.optional(v.string()),
    addressCountry: v.optional(v.string()),
    nokFullName: v.optional(v.string()),
    nokRelationship: v.optional(v.string()),
    nokPhone: v.optional(v.string()),
    nokEmail: v.optional(v.string()),
    nokAddress: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profileId, ...updates } = args;
    const cleanUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) cleanUpdates[key] = value;
    }
    await ctx.db.patch(profileId, cleanUpdates);
    return null;
  },
});

export const deleteProfile = mutation({
  args: { profileId: v.id("talentProfiles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("Profile not found");
    for (const photoId of profile.photos) {
      try { await ctx.storage.delete(photoId); } catch (_) {}
    }
    const interests = await ctx.db
      .query("gigInterests")
      .withIndex("by_talentProfileId", (q) => q.eq("talentProfileId", args.profileId))
      .collect();
    for (const interest of interests) {
      await ctx.db.delete(interest._id);
    }
    await ctx.db.delete(args.profileId);
    return null;
  },
});

export const reapproveProfile = mutation({
  args: {
    profileId: v.id("talentProfiles"),
    feedback: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updates: any = { status: "approved", declineReason: undefined };
    if (args.feedback) updates.adminNotes = args.feedback;
    await ctx.db.patch(args.profileId, updates);
    return null;
  },
});

export const archiveProfile = mutation({
  args: {
    profileId: v.id("talentProfiles"),
    reason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updates: any = { status: "archived" };
    if (args.reason) updates.adminNotes = args.reason;
    await ctx.db.patch(args.profileId, updates);
    return null;
  },
});

export const unarchiveProfile = mutation({
  args: {
    profileId: v.id("talentProfiles"),
    feedback: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updates: any = { status: "approved" };
    if (args.feedback) updates.adminNotes = args.feedback;
    await ctx.db.patch(args.profileId, updates);
    return null;
  },
});

export const bookingCounts = query({
  args: {},
  returns: v.object({
    pending: v.number(),
    confirmed: v.number(),
    total: v.number(),
  }),
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("bookingRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const confirmed = await ctx.db
      .query("bookingRequests")
      .withIndex("by_status", (q) => q.eq("status", "confirmed"))
      .collect();
    const all = await ctx.db.query("bookingRequests").collect();
    return {
      pending: pending.length,
      confirmed: confirmed.length,
      total: all.length,
    };
  },
});

export const gigCounts = query({
  args: {},
  returns: v.object({ open: v.number(), total: v.number() }),
  handler: async (ctx) => {
    const open = await ctx.db
      .query("gigs")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
    const all = await ctx.db.query("gigs").collect();
    return { open: open.length, total: all.length };
  },
});