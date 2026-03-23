import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.string()),
  }).index("email", ["email"])
    .index("by_role", ["role"]),

  talentProfiles: defineTable({
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
    photos: v.array(v.id("_storage")),
    instagram: v.optional(v.string()),
    status: v.string(),
    declineReason: v.optional(v.string()),
    // Contact details
    email: v.optional(v.string()),
    altPhone: v.optional(v.string()),
    // Workplace
    workplace: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    // Social media
    tiktok: v.optional(v.string()),
    twitter: v.optional(v.string()),
    facebook: v.optional(v.string()),
    // Address
    addressStreet: v.optional(v.string()),
    addressCity: v.optional(v.string()),
    addressState: v.optional(v.string()),
    addressPostalCode: v.optional(v.string()),
    addressCountry: v.optional(v.string()),
    // Next of kin
    nokFullName: v.optional(v.string()),
    nokRelationship: v.optional(v.string()),
    nokPhone: v.optional(v.string()),
    nokEmail: v.optional(v.string()),
    nokAddress: v.optional(v.string()),
  }).index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_status_and_city", ["status", "city"]),

  clientProfiles: defineTable({
    userId: v.id("users"),
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
  }).index("by_userId", ["userId"]),

  bookingRequests: defineTable({
    clientId: v.id("users"),
    talentProfileIds: v.array(v.id("talentProfiles")),
    eventType: v.string(),
    eventDate: v.string(),
    city: v.string(),
    venue: v.string(),
    requirements: v.string(),
    status: v.string(),
    adminNotes: v.optional(v.string()),
  }).index("by_clientId", ["clientId"])
    .index("by_status", ["status"]),

  gigs: defineTable({
    title: v.string(),
    description: v.string(),
    eventType: v.string(),
    city: v.string(),
    venue: v.string(),
    eventDate: v.string(),
    talentNeeded: v.number(),
    categories: v.array(v.string()),
    requirements: v.string(),
    compensation: v.string(),
    status: v.string(),
    createdBy: v.id("users"),
  }).index("by_status", ["status"])
    .index("by_createdBy", ["createdBy"]),

  gigInterests: defineTable({
    gigId: v.id("gigs"),
    talentProfileId: v.id("talentProfiles"),
    note: v.optional(v.string()),
    status: v.string(),
  }).index("by_gigId", ["gigId"])
    .index("by_talentProfileId", ["talentProfileId"])
    .index("by_gigId_and_talentProfileId", ["gigId", "talentProfileId"]),

  outfits: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    imagePrompt: v.string(),
    sizes: v.array(v.string()),
    colors: v.array(v.string()),
    brandable: v.boolean(),
    inStock: v.boolean(),
  }).index("by_category", ["category"]),

  outfitOrders: defineTable({
    userId: v.id("users"),
    outfitId: v.id("outfits"),
    orderType: v.string(),
    size: v.string(),
    color: v.string(),
    quantity: v.number(),
    brandingDetails: v.optional(v.string()),
    eventName: v.optional(v.string()),
    eventDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.string(),
  }).index("by_userId", ["userId"])
    .index("by_status", ["status"]),
});