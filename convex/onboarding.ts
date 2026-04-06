import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = internalMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const submitProfile = internalMutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    altPhone: v.optional(v.string()),
    city: v.string(),
    area: v.optional(v.string()),
    race: v.optional(v.string()),
    bodyType: v.optional(v.string()),
    heightCm: v.optional(v.number()),
    bio: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    photos: v.array(v.id("_storage")),
    instagram: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    twitter: v.optional(v.string()),
    facebook: v.optional(v.string()),
    workplace: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
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
  },
  returns: v.id("talentProfiles"),
  handler: async (ctx, args) => {
    // Check for duplicate phone in existing talent profiles
    const allProfiles = await ctx.db.query("talentProfiles").collect();
    const duplicate = allProfiles.find(
      (p) => p.phone === args.phone
    );
    if (duplicate) {
      throw new Error("A talent profile with this phone number already exists. If you need to update your details, please contact Diamond Angels.");
    }

    // Check for duplicate email if provided
    if (args.email) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", args.email!))
        .first();
      if (existingUser) {
        const existingProfile = await ctx.db
          .query("talentProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", existingUser._id))
          .first();
        if (existingProfile) {
          throw new Error("A talent profile with this email already exists.");
        }
      }
    }

    // Create a user record for this talent
    const userId = await ctx.db.insert("users", {
      name: `${args.firstName} ${args.lastName}`,
      email: args.email,
      role: "talent",
    });

    // Create the talent profile
    const { photos, ...profileData } = args;
    const profileId = await ctx.db.insert("talentProfiles", {
      ...profileData,
      photos,
      userId,
      status: "pending",
    });

    return profileId;
  },
});
