import { query, mutation, internalMutation } from "./_generated/server";
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
    eventType: v.optional(v.string()),
    city: v.optional(v.string()),
    venue: v.optional(v.string()),
    eventDate: v.optional(v.string()),
    talentNeeded: v.optional(v.number()),
    categories: v.optional(v.array(v.string())),
    requirements: v.optional(v.string()),
    compensation: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const gig = await ctx.db.get(args.gigId);
    if (!gig) throw new Error("Gig not found");

    // Admins can edit any gig; clients can edit gigs they created
    const isAdmin = user.role === "admin";
    const isOwner = gig.createdBy === userId;
    if (!isAdmin && !isOwner) {
      throw new Error("Not authorized to edit this gig");
    }

    const { gigId, ...updates } = args;
    const cleanUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) cleanUpdates[key] = value;
    }
    await ctx.db.patch(gigId, cleanUpdates);
    return null;
  },
});

// Helper to parse eventDate strings like "27 Apr 2026" or "5-7 Jun 2026" into a sortable timestamp
function parseEventDate(dateStr: string): number {
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  // Handle range dates like "5-7 Jun 2026" — use the first date
  const cleaned = dateStr.replace(/^\d+-/, "");
  const parts = cleaned.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = months[parts[1]] ?? 0;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day).getTime();
  }
  return 0;
}

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
        .collect();
    } else {
      gigs = await ctx.db.query("gigs").collect();
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

    // Sort by event date ascending (closest date first)
    results.sort((a, b) => parseEventDate(a.eventDate) - parseEventDate(b.eventDate));

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

    await ctx.db.insert("gigInterests", {
      gigId: args.gigId,
      talentProfileId: profiles[0]._id,
      note: args.note,
      status: "interested",
    });
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

export const seedDemoGigsFromDashboard = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Admin only");

    const existing = await ctx.db.query("gigs").take(1);
    if (existing.length > 0) return 0;

    const demoGigs = [
      {
        title: "Summer Festival Promoters",
        eventType: "Music Festival",
        description: "We need 20 energetic promoters for a major summer music festival. Must be enthusiastic and good with crowds.",
        city: "Johannesburg",
        venue: "Marks Park, Emmarentia",
        eventDate: "15-16 Feb 2025",
        talentNeeded: 20,
        categories: ["Promoter", "Brand Ambassador"],
        compensation: "R1,500/day",
        requirements: "Energetic, good with crowds, professional appearance",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Luxury Brand Launch Hostesses",
        eventType: "Brand Launch",
        description: "Exclusive product launch for a premium fashion brand. Looking for sophisticated hostesses with luxury event experience.",
        city: "Cape Town",
        venue: "V&A Waterfront",
        eventDate: "8 Mar 2025",
        talentNeeded: 8,
        categories: ["Hostess", "Model"],
        compensation: "R2,000/evening",
        requirements: "Luxury event experience, well-groomed, articulate",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Corporate Golf Day Models",
        eventType: "Golf Day",
        description: "Annual corporate golf day. Need models for registration, beverage service, and prize-giving ceremony.",
        city: "Pretoria",
        venue: "Silver Lakes Golf Estate",
        eventDate: "22 Mar 2025",
        talentNeeded: 6,
        categories: ["Model", "Hostess"],
        compensation: "R1,800/day",
        requirements: "Professional appearance, punctual, corporate dress code",
        status: "open",
        createdBy: userId,
      },
      {
        title: "LIV Golf South Africa - Event Hostesses & Ambience Models",
        eventType: "Golf Day",
        description: "LIV Golf is coming to South Africa! We need 30 premium hostesses and ambience models for a 3-day international golf tournament.",
        city: "Johannesburg",
        venue: "The Wanderers Club, Illovo",
        eventDate: "12-14 Apr 2025",
        talentNeeded: 30,
        categories: ["Model", "Hostess", "Brand Ambassador"],
        compensation: "R3,500/day",
        requirements: "Premium appearance, international event experience preferred, comfortable with media",
        status: "open",
        createdBy: userId,
      },
      {
        title: "SAICA Engineering Golf Day - Hostesses",
        eventType: "Golf Day",
        description: "Annual SAICA Engineering charity golf day. Need professional hostesses for player registration, hole sponsorship activations, and prize-giving.",
        city: "Johannesburg",
        venue: "Houghton Golf Club",
        eventDate: "5 May 2025",
        talentNeeded: 10,
        categories: ["Hostess", "Model", "Brand Ambassador"],
        compensation: "R2,200/day",
        requirements: "Corporate dress code, punctual, articulate, comfortable with executives",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Cape Town Fashion Week Runway Models",
        eventType: "Fashion Show",
        description: "Cape Town Fashion Week needs runway models for multiple designer shows over 3 days. International media exposure.",
        city: "Cape Town",
        venue: "CTICC",
        eventDate: "18-20 Mar 2025",
        talentNeeded: 25,
        categories: ["Model"],
        compensation: "R2,500/day",
        requirements: "Height 170cm+, runway experience preferred, sizes 6-10, castings on 15 Mar",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Wine Festival Brand Ambassadors",
        eventType: "Brand Activation",
        description: "Premium wine brand needs ambassadors for annual wine festival. Must be knowledgeable or willing to learn about wines.",
        city: "Stellenbosch",
        venue: "Spier Wine Farm",
        eventDate: "29 Mar 2025",
        talentNeeded: 8,
        categories: ["Brand Ambassador", "Promoter"],
        compensation: "R1,600/day + tips",
        requirements: "Elegant appearance, wine knowledge a plus, must be 21+",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Durban July VIP Hospitality",
        eventType: "Horse Racing",
        description: "Prestigious Durban July event. Need VIP hospitality hostesses for marquee hosting and guest relations.",
        city: "Durban",
        venue: "Greyville Racecourse",
        eventDate: "5 Jul 2025",
        talentNeeded: 15,
        categories: ["Hostess", "Model"],
        compensation: "R3,000/day",
        requirements: "Premium appearance, own fascinator/hat, formal dress code, VIP hosting experience",
        status: "closed",
        createdBy: userId,
      },
      {
        title: "Tech Expo Product Demo Models",
        eventType: "Exhibition",
        description: "Major tech expo needs product demonstration models for multiple exhibitor stands over 2 days.",
        city: "Johannesburg",
        venue: "Sandton Convention Centre",
        eventDate: "10-11 Apr 2025",
        talentNeeded: 12,
        categories: ["Promoter", "Brand Ambassador"],
        compensation: "R1,800/day",
        requirements: "Tech-savvy, quick learner, comfortable with product demos, professional attire",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Nedbank Cup Final Activations",
        eventType: "Sports Event",
        description: "Brand activation team needed for Nedbank Cup Final. Multiple activation zones around the stadium.",
        city: "Bloemfontein",
        venue: "Toyota Stadium",
        eventDate: "26 Apr 2025",
        talentNeeded: 16,
        categories: ["Promoter", "Brand Ambassador", "Hostess"],
        compensation: "R1,400/day + travel",
        requirements: "Energetic, sports-friendly, travel to Bloemfontein included",
        status: "closed",
        createdBy: userId,
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

export const migrateGigs = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    // Find an admin user to set as creator
    const allUsers = await ctx.db.query("users").collect();
    const adminUser = allUsers.find((u: any) => u.role === "admin");
    if (!adminUser) throw new Error("No admin user found");
    const userId = adminUser._id;

    // Delete all existing gigs and their interests
    const allGigs = await ctx.db.query("gigs").collect();
    for (const gig of allGigs) {
      // Delete associated interests first
      const interests = await ctx.db
        .query("gigInterests")
        .withIndex("by_gigId", (q: any) => q.eq("gigId", gig._id))
        .collect();
      for (const interest of interests) {
        await ctx.db.delete(interest._id);
      }
      await ctx.db.delete(gig._id);
    }

    const newGigs = [
      {
        title: "Devalt Restaurant - Mogodu Monday Launch",
        eventType: "Restaurant Launch",
        description: "Devalt Restaurant in Sunninghill is launching their Mogodu Monday concept! We need 5 ambience promoters who will each bring 5 ladies (25 total guests) to party with them and create an unforgettable atmosphere for this exciting new weekly event. All 25 guests will enjoy complimentary cocktails and platter for 5 on the house. Ambience promoters must be elegant, well-groomed, and comfortable in a fine dining environment.",
        city: "Johannesburg",
        venue: "Devalt Restaurant, Sunninghill",
        eventDate: "27 Apr 2026",
        talentNeeded: 5,
        categories: ["Promoter", "Ambience"],
        compensation: "R1200 per ambience promoter",
        requirements: "Each promoter must bring 5 ladies (25 total guests). Elegant appearance, comfortable in fine dining environments, good at engaging guests and creating atmosphere, punctual. All 25 guests receive complimentary cocktails and platter for 5.",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Collen Mashawana Foundation Golf Day",
        eventType: "Golf Day",
        description: "The Collen Mashawana Foundation Golf Day is taking place at the prestigious Blue Valley Golf Estate in Midrand. We are looking for 23 ladies to serve as promoters and hostesses at the golf day. Roles include player registration, hole sponsorship activations, beverage service on course, and prize-giving ceremony hosting.",
        city: "Midrand",
        venue: "Blue Valley Golf Estate",
        eventDate: "30 Apr 2026",
        talentNeeded: 23,
        categories: ["Promoter", "Hostess"],
        compensation: "R850/day",
        requirements: "Professional appearance, punctual, comfortable engaging with golfers and corporate guests",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Mothers Day Golf Clinic",
        eventType: "Golf Day",
        description: "Celebrate Mother's Day at the Zone Golf Mid-Range with a special Golf Clinic event! We need 8 ladies to assist as hostesses and promoters, helping create a warm and welcoming atmosphere for this special occasion. Roles include registration, guest welcoming, and event coordination support.",
        city: "Johannesburg",
        venue: "Zone Golf Mid-Range",
        eventDate: "10 May 2026",
        talentNeeded: 8,
        categories: ["Hostess", "Promoter"],
        compensation: "R650 for the afternoon",
        requirements: "Warm personality, professional appearance, comfortable in a sporting environment",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Enock Mathebula Golf Day",
        eventType: "Golf Day",
        description: "The Enock Mathebula Golf Day at the prestigious Houghton Golf Club. We are looking for 10 promoters and hostesses for this charity golf day. Duties include player registration, hole activations, beverage cart service, and prize-giving ceremony assistance.",
        city: "Johannesburg",
        venue: "Houghton Golf Club",
        eventDate: "26 May 2026",
        talentNeeded: 10,
        categories: ["Promoter", "Hostess"],
        compensation: "R1050/day",
        requirements: "Corporate dress code, punctual, articulate, comfortable with executives and professionals",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Cape Town Fashion Week Runway Models",
        eventType: "Fashion Show",
        description: "Cape Town Fashion Week needs runway models for multiple designer shows over 3 days. International media exposure guaranteed.",
        city: "Cape Town",
        venue: "CTICC",
        eventDate: "5-7 Jun 2026",
        talentNeeded: 25,
        categories: ["Model"],
        compensation: "R2,500/day",
        requirements: "Height 170cm+, runway experience preferred, sizes 6-10",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Wine Festival Brand Ambassadors",
        eventType: "Brand Activation",
        description: "Premium wine brand needs ambassadors for annual wine festival. Must be knowledgeable or willing to learn about wines.",
        city: "Stellenbosch",
        venue: "Spier Wine Farm",
        eventDate: "20 Jun 2026",
        talentNeeded: 8,
        categories: ["Brand Ambassador", "Promoter"],
        compensation: "R1,600/day + tips",
        requirements: "Elegant appearance, wine knowledge a plus, must be 21+",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Durban July VIP Hospitality",
        eventType: "Horse Racing",
        description: "Prestigious Durban July event. Need VIP hospitality hostesses for marquee hosting and guest relations.",
        city: "Durban",
        venue: "Greyville Racecourse",
        eventDate: "4 Jul 2026",
        talentNeeded: 15,
        categories: ["Hostess", "Model"],
        compensation: "R750/day",
        requirements: "Premium appearance, own fascinator/hat, formal dress code, VIP hosting experience",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Tech Expo Product Demo Models",
        eventType: "Exhibition",
        description: "Major tech expo needs product demonstration models for multiple exhibitor stands over 2 days.",
        city: "Johannesburg",
        venue: "Sandton Convention Centre",
        eventDate: "18-19 Jul 2026",
        talentNeeded: 12,
        categories: ["Promoter", "Brand Ambassador"],
        compensation: "R1,800/day",
        requirements: "Tech-savvy, quick learner, comfortable with product demos, professional attire",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Luxury Brand Launch Hostesses",
        eventType: "Brand Launch",
        description: "Exclusive product launch for a premium fashion brand. Looking for sophisticated hostesses with luxury event experience.",
        city: "Cape Town",
        venue: "V&A Waterfront",
        eventDate: "8 Aug 2026",
        talentNeeded: 8,
        categories: ["Hostess", "Model"],
        compensation: "R2,000/evening",
        requirements: "Luxury event experience, well-groomed, articulate",
        status: "open",
        createdBy: userId,
      },
      {
        title: "Summer Festival Promoters",
        eventType: "Music Festival",
        description: "We need 20 energetic promoters for a major summer music festival. Must be enthusiastic and good with crowds.",
        city: "Johannesburg",
        venue: "Marks Park, Emmarentia",
        eventDate: "22-23 Aug 2026",
        talentNeeded: 20,
        categories: ["Promoter", "Brand Ambassador"],
        compensation: "R1,500/day",
        requirements: "Energetic, good with crowds, professional appearance",
        status: "open",
        createdBy: userId,
      },
    ];

    let count = 0;
    for (const gig of newGigs) {
      await ctx.db.insert("gigs", gig);
      count++;
    }
    return count;
  },
});

export const updateCompensationRates = mutation({
  args: {},
  handler: async (ctx) => {
    const gigs = await ctx.db.query("gigs").collect();
    
    const updates = [
      { title: "Durban July VIP Hospitality", compensation: "R750/day" },
      { title: "Mothers Day Golf Clinic", compensation: "R650 for the afternoon" },
      { title: "Enock Mathebula Golf Day", compensation: "R1050/day" }
    ];
    
    for (const update of updates) {
      const gig = gigs.find((g: any) => g.title.includes(update.title.split(" ")[0]));
      if (gig) {
        await ctx.db.patch(gig._id, { compensation: update.compensation });
      }
    }
    
    return { success: true };
  },
});

export const updateDevaltGig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Find the Devalt gig by title
    const allGigs = await ctx.db.query("gigs").collect();
    const devalt = allGigs.find((g: any) => g.title.includes("Devalt"));
    if (!devalt) throw new Error("Devalt gig not found");
    
    await ctx.db.patch(devalt._id, {
      talentNeeded: 5,
      categories: ["Promoter", "Ambience"],
      compensation: "R1200 per ambience promoter",
      description: "Devalt Restaurant in Sunninghill is launching their Mogodu Monday concept! We need 5 ambience promoters who will each bring 5 ladies (25 total guests) to party with them and create an unforgettable atmosphere for this exciting new weekly event. All 25 guests will enjoy complimentary cocktails and platter for 5 on the house. Ambience promoters must be elegant, well-groomed, and comfortable in a fine dining environment.",
      requirements: "Each promoter must bring 5 ladies (25 total guests). Elegant appearance, comfortable in fine dining environments, good at engaging guests and creating atmosphere, punctual. All 25 guests receive complimentary cocktails and platter for 5."
    });
    return null;
  },
});