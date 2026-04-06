import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listNotices = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("notices"),
      _creationTime: v.number(),
      title: v.string(),
      body: v.string(),
      type: v.string(),
      pinned: v.boolean(),
      createdBy: v.id("users"),
    })
  ),
  handler: async (ctx) => {
    // Get pinned first, then rest by newest
    const pinned = await ctx.db
      .query("notices")
      .withIndex("by_pinned", (q) => q.eq("pinned", true))
      .order("desc")
      .collect();

    const unpinned = await ctx.db
      .query("notices")
      .withIndex("by_pinned", (q) => q.eq("pinned", false))
      .order("desc")
      .collect();

    const all = [...pinned, ...unpinned];
    return all.map((n) => ({
      _id: n._id,
      _creationTime: n._creationTime,
      title: n.title,
      body: n.body,
      type: n.type,
      pinned: n.pinned,
      createdBy: n.createdBy,
    }));
  },
});

export const createNotice = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    type: v.string(),
    pinned: v.boolean(),
  },
  returns: v.id("notices"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .unique();
    if (!user) throw new Error("User not found");
    if (user.role !== "admin") throw new Error("Only admins can create notices");

    return await ctx.db.insert("notices", {
      title: args.title,
      body: args.body,
      type: args.type,
      pinned: args.pinned,
      createdBy: user._id,
    });
  },
});

export const togglePin = mutation({
  args: { id: v.id("notices") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const notice = await ctx.db.get(args.id);
    if (!notice) throw new Error("Notice not found");
    await ctx.db.patch(args.id, { pinned: !notice.pinned });
    return null;
  },
});

export const deleteNotice = mutation({
  args: { id: v.id("notices") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(args.id);
    return null;
  },
});

export const updateNotice = mutation({
  args: {
    id: v.id("notices"),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    type: v.optional(v.string()),
    pinned: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const { id, ...updates } = args;
    const filtered: Record<string, string | boolean> = {};
    if (updates.title !== undefined) filtered.title = updates.title;
    if (updates.body !== undefined) filtered.body = updates.body;
    if (updates.type !== undefined) filtered.type = updates.type;
    if (updates.pinned !== undefined) filtered.pinned = updates.pinned;
    await ctx.db.patch(id, filtered);
    return null;
  },
});

export const seedDemoNotices = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q: any) => q.eq("email", identity.email))
      .unique();
    if (!user) throw new Error("User not found");
    if (user.role !== "admin") throw new Error("Only admins can seed notices");

    const existing = await ctx.db.query("notices").first();
    if (existing) throw new Error("Notices already exist. Delete them first to reseed.");

    const demoNotices = [
      {
        title: "Heineken Festival Promo - Urgent Talent Needed",
        body: "We have an exciting opportunity for 8 brand ambassadors at the Heineken Summer Festival in Johannesburg this Saturday. R2,500 per day. Branded outfits will be provided. Please express interest on the Gigs tab ASAP - spots are filling fast!",
        type: "announcement",
        pinned: true,
      },
      {
        title: "Updated Payment Schedule",
        body: "Please note that all gig payments will now be processed within 5 business days of event completion. Ensure your banking details on your profile are up to date. Contact admin if you have any payment queries.",
        type: "update",
        pinned: false,
      },
      {
        title: "Annual Diamond Angels Photoshoot",
        body: "Our annual portfolio photoshoot is scheduled for 15 February at the Sandton Convention Centre. All active talent members are expected to attend. Professional hair and makeup will be provided. Arrive by 8:00 AM sharp.",
        type: "event",
        pinned: false,
      },
      {
        title: "Profile Completion Reminder",
        body: "Members with incomplete profiles will not be considered for upcoming gigs. Please ensure your photos, contact details, and categories are up to date. Profiles must be at least 80% complete to appear in client searches.",
        type: "reminder",
        pinned: false,
      },
      {
        title: "New Agency Code of Conduct",
        body: "All Diamond Angels talent must adhere to our updated code of conduct effective immediately. This includes professional dress code at events, punctuality (arrive 30 min early), and maintaining a positive social media presence. Violations may result in suspension.",
        type: "alert",
        pinned: false,
      },
    ];

    for (const notice of demoNotices) {
      await ctx.db.insert("notices", {
        ...notice,
        createdBy: user._id,
      });
    }
    return null;
  },
});