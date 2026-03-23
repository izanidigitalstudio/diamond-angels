import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const bookingReturn = v.object({
  _id: v.id("bookingRequests"),
  _creationTime: v.number(),
  clientId: v.id("users"),
  clientName: v.string(),
  clientCompany: v.string(),
  clientPhone: v.string(),
  clientEmail: v.string(),
  talentCount: v.number(),
  eventType: v.string(),
  eventDate: v.string(),
  city: v.string(),
  venue: v.string(),
  requirements: v.string(),
  status: v.string(),
  adminNotes: v.optional(v.string()),
});

export const createBookingRequest = mutation({
  args: {
    talentProfileIds: v.array(v.id("talentProfiles")),
    eventType: v.string(),
    eventDate: v.string(),
    city: v.string(),
    venue: v.string(),
    requirements: v.string(),
  },
  returns: v.id("bookingRequests"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "client")
      throw new Error("Only clients can create booking requests");

    return await ctx.db.insert("bookingRequests", {
      clientId: user._id,
      talentProfileIds: args.talentProfileIds,
      eventType: args.eventType,
      eventDate: args.eventDate,
      city: args.city,
      venue: args.venue,
      requirements: args.requirements,
      status: "pending",
    });
  },
});

export const listBookingRequests = query({
  args: { status: v.optional(v.string()) },
  returns: v.array(bookingReturn),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") return [];

    let bookings;
    if (args.status) {
      bookings = await ctx.db
        .query("bookingRequests")
        .withIndex("by_status", (q: any) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      bookings = await ctx.db
        .query("bookingRequests")
        .order("desc")
        .collect();
    }

    const results = [];
    for (const booking of bookings) {
      const clientProfiles = await ctx.db
        .query("clientProfiles")
        .withIndex("by_userId", (q: any) => q.eq("userId", booking.clientId))
        .take(1);
      const cp = clientProfiles[0];
      results.push({
        _id: booking._id,
        _creationTime: booking._creationTime,
        clientId: booking.clientId,
        clientName: cp ? cp.contactPerson : "Unknown",
        clientCompany: cp ? cp.companyName : "Unknown",
        clientPhone: cp ? cp.phone : "",
        clientEmail: cp ? cp.email : "",
        talentCount: booking.talentProfileIds.length,
        eventType: booking.eventType,
        eventDate: booking.eventDate,
        city: booking.city,
        venue: booking.venue,
        requirements: booking.requirements,
        status: booking.status,
        adminNotes: booking.adminNotes,
      });
    }
    return results;
  },
});

export const getMyBookingRequests = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("bookingRequests"),
      _creationTime: v.number(),
      talentCount: v.number(),
      eventType: v.string(),
      eventDate: v.string(),
      city: v.string(),
      venue: v.string(),
      status: v.string(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user) return [];

    const bookings = await ctx.db
      .query("bookingRequests")
      .withIndex("by_clientId", (q: any) => q.eq("clientId", userId))
      .order("desc")
      .collect();

    return bookings.map((b) => ({
      _id: b._id,
      _creationTime: b._creationTime,
      talentCount: b.talentProfileIds.length,
      eventType: b.eventType,
      eventDate: b.eventDate,
      city: b.city,
      venue: b.venue,
      status: b.status,
    }));
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookingRequests"),
    status: v.string(),
    adminNotes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin")
      throw new Error("Admin only");

    const updates: any = { status: args.status };
    if (args.adminNotes !== undefined) updates.adminNotes = args.adminNotes;
    await ctx.db.patch(args.bookingId, updates);
    return null;
  },
});

const talentProfileBrief = v.object({
  _id: v.id("talentProfiles"),
  firstName: v.string(),
  lastName: v.string(),
  city: v.string(),
  categories: v.array(v.string()),
  photoUrl: v.union(v.string(), v.null()),
  heightCm: v.number(),
  bodyType: v.string(),
  race: v.string(),
  phone: v.string(),
  instagram: v.optional(v.string()),
});

export const getBookingTalent = query({
  args: { bookingId: v.id("bookingRequests") },
  returns: v.array(talentProfileBrief),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) return [];

    const results = [];
    for (const profileId of booking.talentProfileIds) {
      const profile = await ctx.db.get(profileId);
      if (!profile) continue;
      const photoUrl =
        profile.photos.length > 0
          ? await ctx.storage.getUrl(profile.photos[0])
          : null;
      results.push({
        _id: profile._id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        city: profile.city,
        categories: profile.categories,
        photoUrl,
        heightCm: profile.heightCm,
        bodyType: profile.bodyType,
        race: profile.race,
        phone: profile.phone,
        instagram: profile.instagram,
      });
    }
    return results;
  },
});