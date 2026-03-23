import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const talentProfileReturn = v.object({
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

export const createProfile = mutation({
  args: {
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
    photos: v.optional(v.array(v.id("_storage"))),
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
  },
  returns: v.id("talentProfiles"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "talent") throw new Error("Only talent can create profiles");

    const existing = await ctx.db
      .query("talentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    if (existing.length > 0) throw new Error("Profile already exists");

    const { photos, ...rest } = args;

    return await ctx.db.insert("talentProfiles", {
      ...rest,
      photos: photos ?? [],
      userId: user._id,
      status: "pending",
    });
  },
});

export const updateProfile = mutation({
  args: {
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
    photos: v.optional(v.array(v.id("_storage"))),
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
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profiles = await ctx.db
      .query("talentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    if (profiles.length === 0) throw new Error("Profile not found");

    const updates: any = {};
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) updates[key] = value;
    }

    await ctx.db.patch(profiles[0]._id, updates);
    return null;
  },
});

export const getMyProfile = query({
  args: {},
  returns: v.union(talentProfileReturn, v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profiles = await ctx.db
      .query("talentProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    if (profiles.length === 0) return null;

    const profile = profiles[0];
    const photoUrls = await resolvePhotoUrls(ctx, profile.photos);
    return formatProfile(profile, photoUrls);
  },
});

export const getProfile = query({
  args: { profileId: v.id("talentProfiles") },
  returns: v.union(talentProfileReturn, v.null()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db.get(args.profileId);
    if (!profile) return null;

    const photoUrls = await resolvePhotoUrls(ctx, profile.photos);
    return formatProfile(profile, photoUrls);
  },
});

export const listApprovedProfiles = query({
  args: {
    city: v.optional(v.string()),
  },
  returns: v.array(talentProfileReturn),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let profiles;
    if (args.city) {
      profiles = await ctx.db
        .query("talentProfiles")
        .withIndex("by_status_and_city", (q) =>
          q.eq("status", "approved").eq("city", args.city!)
        )
        .collect();
    } else {
      profiles = await ctx.db
        .query("talentProfiles")
        .withIndex("by_status", (q) => q.eq("status", "approved"))
        .collect();
    }

    const results = [];
    for (const profile of profiles) {
      const photoUrls = await resolvePhotoUrls(ctx, profile.photos);
      results.push(formatProfile(profile, photoUrls));
    }
    return results;
  },
});

export const listPendingProfiles = query({
  args: {},
  returns: v.array(talentProfileReturn),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") return [];

    const profiles = await ctx.db
      .query("talentProfiles")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const results = [];
    for (const profile of profiles) {
      const photoUrls = await resolvePhotoUrls(ctx, profile.photos);
      results.push(formatProfile(profile, photoUrls));
    }
    return results;
  },
});

export const listAllProfiles = query({
  args: { status: v.optional(v.string()) },
  returns: v.array(talentProfileReturn),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") return [];

    let profiles;
    if (args.status) {
      profiles = await ctx.db
        .query("talentProfiles")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      profiles = await ctx.db.query("talentProfiles").collect();
    }

    const results = [];
    for (const profile of profiles) {
      const photoUrls = await resolvePhotoUrls(ctx, profile.photos);
      results.push(formatProfile(profile, photoUrls));
    }
    return results;
  },
});

export const approveProfile = mutation({
  args: { profileId: v.id("talentProfiles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin")
      throw new Error("Admin only");

    await ctx.db.patch(args.profileId, { status: "approved" });
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin")
      throw new Error("Admin only");

    await ctx.db.patch(args.profileId, {
      status: "declined",
      declineReason: args.reason,
    });
    return null;
  },
});

// ====== ADMIN PROFILE MANAGEMENT ======

export const adminUpdateProfile = mutation({
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
    status: v.optional(v.string()),
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
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Admin only");

    const { profileId, ...updates } = args;
    const cleanUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) cleanUpdates[key] = value;
    }
    await ctx.db.patch(profileId, cleanUpdates);
    return null;
  },
});

export const adminDeleteProfile = mutation({
  args: { profileId: v.id("talentProfiles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Admin only");

    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("Profile not found");

    // Delete associated photos from storage
    for (const photoId of profile.photos) {
      try { await ctx.storage.delete(photoId); } catch (_) {}
    }

    // Delete gig interests
    const interests = await ctx.db.query("gigInterests").withIndex("by_talentProfileId", (q) => q.eq("talentProfileId", args.profileId)).collect();
    for (const interest of interests) {
      await ctx.db.delete(interest._id);
    }

    await ctx.db.delete(args.profileId);
    return null;
  },
});

export const adminAddPhoto = mutation({
  args: {
    profileId: v.id("talentProfiles"),
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Admin only");

    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("Profile not found");
    if (profile.photos.length >= 5) throw new Error("Maximum 5 photos allowed");

    await ctx.db.patch(args.profileId, {
      photos: [...profile.photos, args.storageId],
    });
    return null;
  },
});

export const adminRemovePhoto = mutation({
  args: {
    profileId: v.id("talentProfiles"),
    photoIndex: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Admin only");

    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("Profile not found");

    const photoId = profile.photos[args.photoIndex];
    if (photoId) {
      try { await ctx.storage.delete(photoId); } catch (_) {}
    }

    const newPhotos = profile.photos.filter((_: any, i: number) => i !== args.photoIndex);
    await ctx.db.patch(args.profileId, { photos: newPhotos });
    return null;
  },
});

export const seedDemoTalent = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    // Clear all existing demo talent
    const existingProfiles = await ctx.db.query("talentProfiles").collect();
    for (const p of existingProfiles) {
      const user = await ctx.db.get(p.userId);
      if (user?.email?.endsWith("@demo.talent")) {
        await ctx.db.delete(user._id);
      }
      await ctx.db.delete(p._id);
    }

    const cities = [
      { city: "Johannesburg", areas: ["Sandton", "Rosebank", "Braamfontein", "Fourways", "Melrose", "Midrand", "Randburg", "Bedfordview", "Morningside", "Parkhurst"] },
      { city: "Cape Town", areas: ["Camps Bay", "V&A Waterfront", "Sea Point", "Century City", "Stellenbosch", "Claremont", "Green Point", "Woodstock"] },
      { city: "Durban", areas: ["Umhlanga", "Ballito", "Gateway", "Berea", "Morningside", "La Lucia", "Florida Road"] },
      { city: "Pretoria", areas: ["Menlyn", "Brooklyn", "Centurion", "Hatfield", "Waterkloof", "Lynnwood"] },
      { city: "Port Elizabeth", areas: ["Summerstrand", "Richmond Hill", "Walmer"] },
      { city: "Bloemfontein", areas: ["Westdene", "Langenhoven Park", "Universitas"] },
    ];
    const categories = ["Events", "Promotions", "Club", "Golf Days", "Activations", "Fashion Shows"];
    const bodyTypes = ["Slim", "Athletic", "Curvy", "Petite"];
    const bios = [
      "Professional model with extensive experience in high-profile events and brand activations across South Africa. Known for reliability and elegance.",
      "Energetic and reliable talent specialising in promotional events, product launches, and consumer engagement. Excellent crowd interaction skills.",
      "Runway-trained model with a strong portfolio in fashion shows, editorials, and luxury brand campaigns. Featured at SA Fashion Week.",
      "Versatile talent comfortable in any setting, from corporate golf days to high-energy nightlife events. Always camera-ready.",
      "Experienced promotional model known for professionalism, punctuality, and excellent crowd engagement at major brand activations.",
      "Dynamic model with a passion for fashion and a natural ability to connect with audiences at live events and activations.",
      "Seasoned talent with experience at SA Fashion Week, Durban July, and multiple national brand campaigns across the country.",
      "Friendly, professional, and always camera-ready. Available for activations, events, corporate functions, and fashion shows.",
      "Bilingual model fluent in English and Zulu. Strong social media presence with an engaged following. Great brand ambassador.",
      "Confident and charismatic model with a background in dance and performance, perfect for live events and stage activations.",
      "Highly sought-after model for golf days, corporate functions, and VIP hospitality events. Impeccable presentation.",
      "Editorial and commercial model with a unique look. Experienced in print, digital, and runway work across Southern Africa.",
      "Brand ambassador with proven experience increasing consumer engagement at activations and trade shows nationwide.",
      "Professional hostess and model with 5+ years in the events and promotions industry across Gauteng and KZN.",
      "Fashion-forward talent with a keen eye for styling. Regular at Johannesburg and Cape Town fashion weeks.",
      "Vibrant personality with a warm smile. Specialises in consumer-facing brand activations and hospitality events.",
      "Experienced in luxury brand campaigns and high-end corporate events. Fluent in English, Afrikaans, and Sotho.",
      "Award-winning promotional model with expertise in experiential marketing and live brand experiences.",
      "Natural in front of the camera with editorial and catalogue experience. Available nationwide for bookings.",
      "Passionate about the modelling industry with a focus on empowerment and positive brand representation.",
    ];

    function pick(arr: any[]) { return arr[Math.floor(Math.random() * arr.length)]; }
    function pickN(arr: any[], n: number) {
      const shuffled = [...arr].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, n);
    }

    // 30 Black SA women (60%)
    const blackNames: [string, string][] = [
      ["Naledi", "Mokoena"], ["Thando", "Ndlovu"], ["Zinhle", "Dlamini"], ["Ayanda", "Khumalo"],
      ["Lerato", "Molefe"], ["Nomvula", "Sithole"], ["Khanyi", "Zulu"], ["Bontle", "Mahlangu"],
      ["Thandiwe", "Mthembu"], ["Nompumelelo", "Nkosi"], ["Sbahle", "Cele"], ["Nosipho", "Mkhize"],
      ["Enhle", "Ngcobo"], ["Thandeka", "Zwane"], ["Minenhle", "Shabalala"], ["Nokuthula", "Maseko"],
      ["Sindi", "Radebe"], ["Palesa", "Modise"], ["Mpho", "Mokwena"], ["Dineo", "Kgosana"],
      ["Refilwe", "Phiri"], ["Lesedi", "Mabena"], ["Lebo", "Tshabalala"], ["Ntombi", "Vilakazi"],
      ["Buhle", "Majola"], ["Zanele", "Buthelezi"], ["Nonhlanhla", "Nxumalo"], ["Lungile", "Mthethwa"],
      ["Sindisiwe", "Gumede"], ["Andiswa", "Dube"],
    ];

    // 10 Coloured SA women (20%)
    const colouredNames: [string, string][] = [
      ["Taryn", "Adams"], ["Jessica", "Davids"], ["Chanel", "Paulse"], ["Bianca", "Williams"],
      ["Tamlyn", "September"], ["Leigh-Ann", "Abrahams"], ["Cheslyn", "Titus"], ["Megan", "Petersen"],
      ["Roxanne", "Hendricks"], ["Kim", "Alexander"],
    ];

    // 4 White SA women
    const whiteNames: [string, string][] = [
      ["Chloe", "van der Merwe"], ["Hannah", "Botha"], ["Megan", "Peters"], ["Bianca", "Joubert"],
    ];

    // 3 Indian SA women
    const indianNames: [string, string][] = [
      ["Priya", "Naidoo"], ["Anisha", "Pillay"], ["Kavitha", "Govender"],
    ];

    // 3 Asian SA women
    const asianNames: [string, string][] = [
      ["Mei-Lin", "Chen"], ["Yuki", "Tanaka"], ["Sakura", "Kim"],
    ];

    let count = 0;

    async function seedGroup(names: [string, string][], race: string) {
      for (let i = 0; i < names.length; i++) {
        const [firstName, lastName] = names[i];
        const loc = pick(cities);
        const area = pick(loc.areas);
        const cats = pickN(categories, 2 + Math.floor(Math.random() * 3));
        const bt = pick(bodyTypes);
        const height = 158 + Math.floor(Math.random() * 24);
        const bio = pick(bios);
        const phone = `07${String(10000000 + count * 111 + i * 7).slice(-8)}`;

        const userId = await ctx.db.insert("users", {
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/ /g, "")}@demo.talent`,
          role: "talent",
        });
        await ctx.db.insert("talentProfiles", {
          userId,
          firstName,
          lastName,
          phone,
          city: loc.city,
          area,
          race,
          bodyType: bt,
          heightCm: height,
          bio,
          categories: cats,
          photos: [],
          instagram: `@${firstName.toLowerCase()}${lastName.toLowerCase().replace(/ /g, "")}`,
          status: "approved",
        });
        count++;
      }
    }

    await seedGroup(blackNames, "Black");
    await seedGroup(colouredNames, "Coloured");
    await seedGroup(whiteNames, "White");
    await seedGroup(indianNames, "Indian");
    await seedGroup(asianNames, "Asian");

    return `Seeded ${count} talent profiles (30 Black, 10 Coloured, 4 White, 3 Indian, 3 Asian)`;
  },
});

export const clearDemoTalent = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const profiles = await ctx.db.query("talentProfiles").collect();
    let count = 0;
    for (const p of profiles) {
      // Delete associated demo users
      const user = await ctx.db.get(p.userId);
      if (user?.email?.endsWith("@demo.talent")) {
        await ctx.db.delete(user._id);
      }
      // Delete photos from storage
      for (const photoId of p.photos) {
        try { await ctx.storage.delete(photoId); } catch (_) {}
      }
      await ctx.db.delete(p._id);
      count++;
    }
    return count;
  },
});