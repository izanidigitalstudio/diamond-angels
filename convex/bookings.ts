import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
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

    const bookingId = await ctx.db.insert("bookingRequests", {
      clientId: user._id,
      talentProfileIds: args.talentProfileIds,
      eventType: args.eventType,
      eventDate: args.eventDate,
      city: args.city,
      venue: args.venue,
      requirements: args.requirements,
      status: "pending",
    });

    // Send email notification to admin(s)
    const clientProfiles = await ctx.db
      .query("clientProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .take(1);
    const cp = clientProfiles[0];

    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q: any) => q.eq("role", "admin"))
      .collect();

    for (const admin of admins) {
      if (admin.email) {
        await ctx.scheduler.runAfter(0, internal.email.sendNewBookingNotification, {
          adminEmail: admin.email,
          clientName: cp ? cp.contactPerson : user.name ?? "Unknown",
          clientCompany: cp ? cp.companyName : "Unknown",
          clientEmail: cp ? cp.email : user.email ?? "",
          clientPhone: cp ? cp.phone : "",
          eventType: args.eventType,
          eventDate: args.eventDate,
          venue: args.venue,
          city: args.city,
          talentCount: args.talentProfileIds.length,
          requirements: args.requirements,
        });
      }
    }

    return bookingId;
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

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    const updates: any = { status: args.status };
    if (args.adminNotes !== undefined) updates.adminNotes = args.adminNotes;
    await ctx.db.patch(args.bookingId, updates);

    // Send email notification to the client
    const clientProfiles = await ctx.db
      .query("clientProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", booking.clientId))
      .take(1);
    const cp = clientProfiles[0];
    if (cp && cp.email) {
      await ctx.scheduler.runAfter(0, internal.email.sendBookingStatusEmail, {
        clientEmail: cp.email,
        clientName: cp.contactPerson,
        eventType: booking.eventType,
        eventDate: booking.eventDate,
        venue: booking.venue,
        city: booking.city,
        status: args.status,
        adminNotes: args.adminNotes,
      });
    }

    // Send SMS notification to client via Clickatell
    if (cp && cp.phone) {
      await ctx.scheduler.runAfter(0, internal.sms.sendClientBookingConfirmationSms, {
        clientPhone: cp.phone,
        clientName: cp.contactPerson,
        eventType: booking.eventType,
        eventDate: booking.eventDate,
        venue: booking.venue,
        city: booking.city,
        status: args.status,
      });
    }

    // When booking is confirmed, also SMS the selected talent
    if (args.status === "confirmed" && booking.talentProfileIds?.length > 0) {
      for (const profileId of booking.talentProfileIds) {
        const profile = await ctx.db.get(profileId);
        if (profile && profile.phone) {
          await ctx.scheduler.runAfter(0, internal.sms.sendBookingConfirmationSms, {
            talentPhone: profile.phone,
            talentName: `${profile.firstName} ${profile.lastName}`,
            eventType: booking.eventType,
            eventDate: booking.eventDate,
            venue: booking.venue,
            city: booking.city,
            clientName: cp ? cp.contactPerson : undefined,
          });
        }
      }
    }

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

export const seedDemoBookings = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Admin only");

    const existing = await ctx.db.query("bookingRequests").take(1);
    if (existing.length > 0) return 0;

    const demoBookings = [
      {
        clientId: userId,
        talentProfileIds: [] as any,
        eventType: "Product Launch",
        eventDate: "15 Feb 2025",
        city: "Johannesburg",
        venue: "Sandton Convention Centre",
        requirements: "8 hostesses for premium skincare product launch. Must have luxury brand experience, well-groomed, and articulate.",
        status: "pending",
      },
      {
        clientId: userId,
        talentProfileIds: [] as any,
        eventType: "Corporate Awards Dinner",
        eventDate: "22 Feb 2025",
        city: "Durban",
        venue: "Durban ICC",
        requirements: "6 hostesses for annual corporate awards ceremony. Evening wear, professional demeanor required. Experience with formal events preferred.",
        status: "pending",
      },
      {
        clientId: userId,
        talentProfileIds: [] as any,
        eventType: "Wedding Expo",
        eventDate: "1-2 Mar 2025",
        city: "Cape Town",
        venue: "CTICC",
        requirements: "10 models for bridal fashion runway show and exhibition stand hostessing. Must be comfortable on runway.",
        status: "confirmed",
      },
      {
        clientId: userId,
        talentProfileIds: [] as any,
        eventType: "Fashion Show",
        eventDate: "8 Mar 2025",
        city: "Midrand",
        venue: "Mall of Africa",
        requirements: "12 runway models for seasonal fashion showcase. Height 170cm+, sizes 6-10. Rehearsal on 7 Mar required.",
        status: "confirmed",
      },
      {
        clientId: userId,
        talentProfileIds: [] as any,
        eventType: "Music Festival VIP",
        eventDate: "15-16 Mar 2025",
        city: "Johannesburg",
        venue: "Marks Park, Emmarentia",
        requirements: "15 brand ambassadors for VIP lounge area. Energetic, good with crowds, professional appearance. Must be available both days.",
        status: "pending",
      },
      {
        clientId: userId,
        talentProfileIds: [] as any,
        eventType: "Charity Gala Evening",
        eventDate: "22 Mar 2025",
        city: "Johannesburg",
        venue: "The Venue, Melrose Arch",
        requirements: "8 hostesses for black-tie charity gala. Must own elegant evening wear. Experience with high-profile guests essential.",
        status: "confirmed",
      },
      {
        clientId: userId,
        talentProfileIds: [] as any,
        eventType: "Wine Tasting Activation",
        eventDate: "29 Mar 2025",
        city: "Cape Town",
        venue: "Steenberg Wine Estate",
        requirements: "4 brand ambassadors for premium wine brand activation. Must be knowledgeable about wine or willing to learn. Elegant casual dress code.",
        status: "declined",
        adminNotes: "Insufficient budget for requested talent count.",
      },
      {
        clientId: userId,
        talentProfileIds: [] as any,
        eventType: "Car Launch Activation",
        eventDate: "5 Apr 2025",
        city: "Johannesburg",
        venue: "Kyalami Grand Prix Circuit",
        requirements: "10 models for luxury car brand launch. Must be comfortable with automotive photography. Full day event with media coverage.",
        status: "pending",
      },
      {
        clientId: userId,
        talentProfileIds: [] as any,
        eventType: "International Sports Event",
        eventDate: "12 Jan 2025",
        city: "Johannesburg",
        venue: "FNB Stadium",
        requirements: "20 hostesses for international rugby tournament. Stadium experience preferred. Must be available for full match day (6am - 10pm).",
        status: "completed",
      },
      {
        clientId: userId,
        talentProfileIds: [] as any,
        eventType: "Corporate Year-End Function",
        eventDate: "6 Dec 2024",
        city: "Cape Town",
        venue: "Shimmy Beach Club",
        requirements: "6 hostesses for corporate year-end beach party. Smart casual. Must be comfortable in outdoor beach venue setting.",
        status: "completed",
      },
    ];

    let count = 0;
    for (const booking of demoBookings) {
      await ctx.db.insert("bookingRequests", booking);
      count++;
    }
    return count;
  },
});