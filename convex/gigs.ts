import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const gigReturn = v.object({
  _id: v.id("gigs"),
  _creationTime: v.number(),
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
  interestCount: v.number(),
});

export const createGig = mutation({
  args: {
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
  },
  returns: v.id("gigs"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || !["admin", "client"].includes(user.role ?? ""))
      throw new Error("Only admins and clients can create gigs");

    return await ctx.db.insert("gigs", {
      ...args,
      status: "open",
      createdBy: user._id,
    });
  },
});

export const updateGig = mutation({
  args: {
    gigId: v.id("gigs"),
    status: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin")
      throw new Error("Admin only");

    const { gigId, ...updates } = args;
    const cleanUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) cleanUpdates[key] = value;
    }
    await ctx.db.patch(gigId, cleanUpdates);
    return null;
  },
});

export const listGigs = query({
  args: { status: v.optional(v.string()) },
  returns: v.array(gigReturn),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let gigs;
    if (args.status) {
      gigs = await ctx.db
        .query("gigs")
        .withIndex("by_status", (q: any) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      gigs = await ctx.db.query("gigs").order("desc").collect();
    }

    const results = [];
    for (const gig of gigs) {
      const interests = await ctx.db
        .query("gigInterests")
        .withIndex("by_gigId", (q: any) => q.eq("gigId", gig._id))
        .collect();
      results.push({
        _id: gig._id,
        _creationTime: gig._creationTime,
        title: gig.title,
        description: gig.description,
        eventType: gig.eventType,
        city: gig.city,
        venue: gig.venue,
        eventDate: gig.eventDate,
        talentNeeded: gig.talentNeeded,
        categories: gig.categories,
        requirements: gig.requirements,
        compensation: gig.compensation,
        status: gig.status,
        createdBy: gig.createdBy,
        interestCount: interests.length,
      });
    }
    return results;
  },
});

export const getGig = query({
  args: { gigId: v.id("gigs") },
  returns: v.union(gigReturn, v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const gig = await ctx.db.get(args.gigId);
    if (!gig) return null;

    const interests = await ctx.db
      .query("gigInterests")
      .withIndex("by_gigId", (q: any) => q.eq("gigId", gig._id))
      .collect();

    return {
      _id: gig._id,
      _creationTime: gig._creationTime,
      title: gig.title,
      description: gig.description,
      eventType: gig.eventType,
      city: gig.city,
      venue: gig.venue,
      eventDate: gig.eventDate,
      talentNeeded: gig.talentNeeded,
      categories: gig.categories,
      requirements: gig.requirements,
      compensation: gig.compensation,
      status: gig.status,
      createdBy: gig.createdBy,
      interestCount: interests.length,
    };
  },
});

export const expressInterest = mutation({
  args: {
    gigId: v.id("gigs"),
    note: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "talent")
      throw new Error("Only talent can express interest");

    const profiles = await ctx.db
      .query("talentProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .take(1);
    if (profiles.length === 0) throw new Error("No talent profile found");
    if (profiles[0].status !== "approved")
      throw new Error("Profile must be approved");

    const existing = await ctx.db
      .query("gigInterests")
      .withIndex("by_gigId_and_talentProfileId", (q: any) =>
        q.eq("gigId", args.gigId).eq("talentProfileId", profiles[0]._id)
      )
      .take(1);
    if (existing.length > 0) throw new Error("Already expressed interest");

    const gig = await ctx.db.get(args.gigId);
    if (!gig) throw new Error("Gig not found");

    await ctx.db.insert("gigInterests", {
      gigId: args.gigId,
      talentProfileId: profiles[0]._id,
      note: args.note,
      status: "interested",
    });

    // Send interest notification to client
    const gigCreator = await ctx.db.get(gig.createdBy);
    const talentName = profiles[0].firstName && profiles[0].lastName
      ? `${profiles[0].firstName} ${profiles[0].lastName}`
      : "A Talent";
    
    if (gigCreator?.email) {
      const clientProfiles = await ctx.db
        .query("clientProfiles")
        .withIndex("by_userId", (q: any) => q.eq("userId", gig.createdBy))
        .take(1);
      const cp = clientProfiles[0];
      const clientName = cp?.contactPerson || gigCreator.name || "Client";

      await ctx.scheduler.runAfter(
        0,
        internal.email.sendInterestExpressedEmail,
        {
          clientEmail: gigCreator.email,
          clientName,
          talentName,
          eventType: gig.eventType,
        }
      );
    }
    return null;
  },
});

export const withdrawInterest = mutation({
  args: { gigId: v.id("gigs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const profiles = await ctx.db
      .query("talentProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .take(1);
    if (profiles.length === 0) throw new Error("No profile found");

    const interests = await ctx.db
      .query("gigInterests")
      .withIndex("by_gigId_and_talentProfileId", (q: any) =>
        q.eq("gigId", args.gigId).eq("talentProfileId", profiles[0]._id)
      )
      .take(1);
    if (interests.length > 0) {
      await ctx.db.delete(interests[0]._id);
    }
    return null;
  },
});

const talentProfileReturn = v.object({
  _id: v.id("talentProfiles"),
  firstName: v.string(),
  lastName: v.string(),
  city: v.string(),
  area: v.string(),
  race: v.string(),
  bodyType: v.string(),
  heightCm: v.number(),
  categories: v.array(v.string()),
  photoUrls: v.array(v.union(v.string(), v.null())),
  instagram: v.optional(v.string()),
  phone: v.string(),
  bio: v.string(),
  note: v.optional(v.string()),
});

export const getGigInterests = query({
  args: { gigId: v.id("gigs") },
  returns: v.array(talentProfileReturn),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const interests = await ctx.db
      .query("gigInterests")
      .withIndex("by_gigId", (q: any) => q.eq("gigId", args.gigId))
      .collect();

    const results = [];
    for (const interest of interests) {
      const profile = await ctx.db.get(interest.talentProfileId);
      if (!profile) continue;
      const photoUrls = await Promise.all(
        profile.photos.map((id: any) => ctx.storage.getUrl(id))
      );
      results.push({
        _id: profile._id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        city: profile.city,
        area: profile.area,
        race: profile.race,
        bodyType: profile.bodyType,
        heightCm: profile.heightCm,
        categories: profile.categories,
        photoUrls,
        instagram: profile.instagram,
        phone: profile.phone,
        bio: profile.bio,
        note: interest.note,
      });
    }
    return results;
  },
});

export const getMyInterests = query({
  args: {},
  returns: v.array(
    v.object({
      gigId: v.id("gigs"),
      gigTitle: v.string(),
      gigCity: v.string(),
      gigDate: v.string(),
      gigStatus: v.string(),
      interestStatus: v.string(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user) return [];

    const profiles = await ctx.db
      .query("talentProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .take(1);
    if (profiles.length === 0) return [];

    const interests = await ctx.db
      .query("gigInterests")
      .withIndex("by_talentProfileId", (q: any) =>
        q.eq("talentProfileId", profiles[0]._id)
      )
      .collect();

    const results = [];
    for (const interest of interests) {
      const gig = await ctx.db.get(interest.gigId);
      if (!gig) continue;
      results.push({
        gigId: gig._id,
        gigTitle: gig.title,
        gigCity: gig.city,
        gigDate: gig.eventDate,
        gigStatus: gig.status,
        interestStatus: interest.status,
      });
    }
    return results;
  },
});

export const seedDemoGigs = internalMutation({
  args: { userId: v.id("users") },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Don't seed if this user already has gigs
    const existing = await ctx.db
      .query("gigs")
      .withIndex("by_createdBy", (q: any) => q.eq("createdBy", args.userId))
      .take(1);
    if (existing.length > 0) return 0;

    const demoGigs = [
      {
        title: 'Summer Festival Promoters',
        eventType: 'Music Festival',
        description: 'We need 20 energetic promoters for a major summer music festival. Must be enthusiastic and good with crowds.',
        city: 'Johannesburg',
        venue: 'Marks Park, Emmarentia',
        eventDate: '15-16 Feb 2025',
        talentNeeded: 20,
        categories: ['Promoter', 'Brand Ambassador'],
        compensation: 'R1,500/day',
        requirements: 'Energetic, good with crowds, professional appearance',
        status: 'open',
        createdBy: args.userId,
      },
      {
        title: 'Luxury Brand Launch Hostesses',
        eventType: 'Brand Launch',
        description: 'Exclusive product launch for a premium fashion brand. Looking for sophisticated hostesses with luxury event experience.',
        city: 'Cape Town',
        venue: 'V&A Waterfront',
        eventDate: '8 Mar 2025',
        talentNeeded: 8,
        categories: ['Hostess', 'Model'],
        compensation: 'R2,000/evening',
        requirements: 'Luxury event experience, well-groomed, articulate',
        status: 'open',
        createdBy: args.userId,
      },
      {
        title: 'Corporate Golf Day Models',
        eventType: 'Golf Day',
        description: 'Annual corporate golf day. Need models for registration, beverage service, and prize-giving ceremony.',
        city: 'Pretoria',
        venue: 'Silver Lakes Golf Estate',
        eventDate: '22 Mar 2025',
        talentNeeded: 6,
        categories: ['Model', 'Hostess'],
        compensation: 'R1,800/day',
        requirements: 'Professional appearance, punctual, corporate dress code',
        status: 'open',
        createdBy: args.userId,
      },
      {
        title: 'LIV Golf South Africa - Event Hostesses & Ambience Models',
        eventType: 'Golf Day',
        description: 'LIV Golf is coming to South Africa! We need 30 premium hostesses and ambience models for a 3-day international golf tournament. Roles include VIP hospitality lounge hosting, player registration, beverage cart models, branded activation stands, and on-course ambience. Must be professional, well-groomed, and comfortable in an upscale international sporting environment. International media exposure guaranteed.',
        city: 'Johannesburg',
        venue: 'The Wanderers Club, Illovo',
        eventDate: '12-14 Apr 2025',
        talentNeeded: 30,
        categories: ['Model', 'Hostess', 'Brand Ambassador'],
        compensation: 'R3,500/day',
        requirements: 'Premium appearance, international event experience preferred, comfortable with media',
        status: 'open',
        createdBy: args.userId,
      },
      {
        title: 'SAICA Engineering Golf Day - Hostesses & Registration Models',
        eventType: 'Golf Day',
        description: 'Annual SAICA Engineering charity golf day at the prestigious Houghton Golf Club. Need 10 professional hostesses and models for player registration, hole sponsorship activations, beverage service on course, and prize-giving ceremony hosting. Corporate dress code. Must be punctual, articulate, and comfortable engaging with senior executives and professionals.',
        city: 'Johannesburg',
        venue: 'Houghton Golf Club',
        eventDate: '5 May 2025',
        talentNeeded: 10,
        categories: ['Hostess', 'Model', 'Brand Ambassador'],
        compensation: 'R2,200/day',
        requirements: 'Corporate dress code, punctual, articulate, comfortable with executives',
        status: 'open',
        createdBy: args.userId,
      },
    ];

    let count = 0;
    for (const gig of demoGigs) {
      await ctx.db.insert("gigs", gig);
      count++;
    }
    return count;
  },
});