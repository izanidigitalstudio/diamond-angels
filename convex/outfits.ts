import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const OUTFIT_CATEGORIES = [
  "Events",
  "Promotions",
  "Club",
  "Golf Days",
  "Activations",
  "Fashion Shows",
] as const;

export const listByCategory = query({
  args: { category: v.optional(v.string()) },
  returns: v.array(
    v.object({
      _id: v.id("outfits"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      category: v.string(),
      price: v.number(),
      imagePrompt: v.string(),
      sizes: v.array(v.string()),
      colors: v.array(v.string()),
      brandable: v.boolean(),
      inStock: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    if (args.category) {
      const results = await ctx.db
        .query("outfits")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
      return results.map((o) => ({
        _id: o._id,
        _creationTime: o._creationTime,
        name: o.name,
        description: o.description,
        category: o.category,
        price: o.price,
        imagePrompt: o.imagePrompt,
        sizes: o.sizes,
        colors: o.colors,
        brandable: o.brandable,
        inStock: o.inStock,
      }));
    }
    const results = await ctx.db.query("outfits").collect();
    return results.map((o) => ({
      _id: o._id,
      _creationTime: o._creationTime,
      name: o.name,
      description: o.description,
      category: o.category,
      price: o.price,
      imagePrompt: o.imagePrompt,
      sizes: o.sizes,
      colors: o.colors,
      brandable: o.brandable,
      inStock: o.inStock,
    }));
  },
});

export const getById = query({
  args: { id: v.id("outfits") },
  returns: v.union(
    v.object({
      _id: v.id("outfits"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      category: v.string(),
      price: v.number(),
      imagePrompt: v.string(),
      sizes: v.array(v.string()),
      colors: v.array(v.string()),
      brandable: v.boolean(),
      inStock: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const outfit = await ctx.db.get(args.id);
    if (!outfit) return null;
    return {
      _id: outfit._id,
      _creationTime: outfit._creationTime,
      name: outfit.name,
      description: outfit.description,
      category: outfit.category,
      price: outfit.price,
      imagePrompt: outfit.imagePrompt,
      sizes: outfit.sizes,
      colors: outfit.colors,
      brandable: outfit.brandable,
      inStock: outfit.inStock,
    };
  },
});

export const submitOrder = mutation({
  args: {
    outfitId: v.id("outfits"),
    orderType: v.string(),
    size: v.string(),
    color: v.string(),
    quantity: v.number(),
    brandingDetails: v.optional(v.string()),
    eventName: v.optional(v.string()),
    eventDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("outfitOrders"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .unique();
    if (!user) throw new Error("User not found");
    const outfit = await ctx.db.get(args.outfitId);
    if (!outfit) throw new Error("Outfit not found");
    return await ctx.db.insert("outfitOrders", {
      userId: user._id,
      outfitId: args.outfitId,
      orderType: args.orderType,
      size: args.size,
      color: args.color,
      quantity: args.quantity,
      brandingDetails: args.brandingDetails,
      eventName: args.eventName,
      eventDate: args.eventDate,
      notes: args.notes,
      status: "pending",
    });
  },
});

export const getMyOrders = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("outfitOrders"),
      _creationTime: v.number(),
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
      outfitName: v.string(),
      outfitPrice: v.number(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .unique();
    if (!user) return [];
    const orders = await ctx.db
      .query("outfitOrders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
    const result = [];
    for (const order of orders) {
      const outfit = await ctx.db.get(order.outfitId);
      result.push({
        _id: order._id,
        _creationTime: order._creationTime,
        outfitId: order.outfitId,
        orderType: order.orderType,
        size: order.size,
        color: order.color,
        quantity: order.quantity,
        brandingDetails: order.brandingDetails,
        eventName: order.eventName,
        eventDate: order.eventDate,
        notes: order.notes,
        status: order.status,
        outfitName: outfit?.name ?? "Unknown",
        outfitPrice: outfit?.price ?? 0,
      });
    }
    return result;
  },
});

export const seedOutfits = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("outfits").take(1);
    if (existing.length > 0) return null;

    const outfits = [
      // Events
      {
        name: "Elegant Gold Bodycon",
        description: "Sleek gold bodycon dress perfect for corporate events and award ceremonies. Features a subtle shimmer finish that catches the light beautifully.",
        category: "Events",
        price: 1200,
        imagePrompt: "elegant gold bodycon dress on mannequin, corporate event fashion, luxury styling, dark background, professional product photography",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Gold", "Black", "Silver"],
        brandable: true,
        inStock: true,
      },
      {
        name: "Classic Black Cocktail",
        description: "Timeless black cocktail dress with modern cut. Ideal for conferences, galas, and upscale evening events.",
        category: "Events",
        price: 950,
        imagePrompt: "classic black cocktail dress, elegant modern cut, luxury fashion, studio photography, dark moody lighting",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Black", "Navy", "Burgundy"],
        brandable: true,
        inStock: true,
      },
      {
        name: "Red Carpet Gown",
        description: "Stunning floor-length gown for award ceremonies and high-profile events. Flowing silhouette with an elegant train.",
        category: "Events",
        price: 2500,
        imagePrompt: "stunning red floor-length evening gown, red carpet fashion, glamorous, luxury fabric, professional fashion photography",
        sizes: ["S", "M", "L"],
        colors: ["Red", "Emerald", "Royal Blue"],
        brandable: false,
        inStock: true,
      },
      // Promotions
      {
        name: "Branded Polo Set",
        description: "Professional branded polo shirt set with matching skirt. Perfect for in-store promotions and brand activations. Easy to add logos and branding.",
        category: "Promotions",
        price: 450,
        imagePrompt: "professional white polo shirt and skirt set, brand ambassador uniform, clean modern style, product photography on white background",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["White", "Black", "Red", "Royal Blue"],
        brandable: true,
        inStock: true,
      },
      {
        name: "Promo Bodysuit & Shorts",
        description: "Eye-catching bodysuit and high-waisted shorts combo. Great for outdoor promotions, festivals, and activations.",
        category: "Promotions",
        price: 380,
        imagePrompt: "stylish bodysuit and high-waisted shorts set, promotional model outfit, vibrant colors, product photography",
        sizes: ["XS", "S", "M", "L"],
        colors: ["White", "Black", "Pink", "Yellow"],
        brandable: true,
        inStock: true,
      },
      {
        name: "Corporate Blaze Set",
        description: "Sophisticated blazer and skirt combo for corporate promotions and launches. Professional yet stylish.",
        category: "Promotions",
        price: 750,
        imagePrompt: "tailored blazer and pencil skirt set, corporate fashion, professional women's outfit, product photography, clean background",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "White", "Charcoal"],
        brandable: true,
        inStock: true,
      },
      // Club
      {
        name: "Sequin Mini Dress",
        description: "Show-stopping sequin mini dress for club events and nightlife. Dazzling under club lights.",
        category: "Club",
        price: 850,
        imagePrompt: "sequin mini dress, nightclub fashion, sparkly glamorous outfit, dark neon lighting, product photography",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Silver", "Gold", "Black", "Pink"],
        brandable: false,
        inStock: true,
      },
      {
        name: "Bottle Girl Corset Set",
        description: "Premium corset top and matching skirt set designed for bottle service. Customizable with venue branding.",
        category: "Club",
        price: 680,
        imagePrompt: "black corset top and mini skirt set, VIP bottle service outfit, luxury nightclub fashion, dark glamorous photography",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Black", "Red", "White", "Gold"],
        brandable: true,
        inStock: true,
      },
      {
        name: "Neon Mesh Outfit",
        description: "Bold neon mesh bodysuit with matching accessories. Perfect for themed club nights and music events.",
        category: "Club",
        price: 520,
        imagePrompt: "neon mesh bodysuit, rave party outfit, bold colorful fashion, UV reactive, product photography dark background",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Neon Pink", "Neon Green", "Neon Orange"],
        brandable: true,
        inStock: true,
      },
      // Golf Days
      {
        name: "Golf Day Dress",
        description: "Elegant yet sporty golf day dress. Perfect for corporate golf days. Comfortable and stylish with room for branding.",
        category: "Golf Days",
        price: 550,
        imagePrompt: "sporty elegant white golf dress, women's golf fashion, green golf course background, clean bright photography",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["White", "Navy", "Light Blue", "Pink"],
        brandable: true,
        inStock: true,
      },
      {
        name: "Golf Polo & Skort",
        description: "Classic golf polo paired with a modern skort. Easy branding placement on polo front and back.",
        category: "Golf Days",
        price: 480,
        imagePrompt: "women's golf polo and skort set, country club fashion, bright outdoor photography, professional sportswear",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["White/Navy", "Pink/White", "Black/Gold"],
        brandable: true,
        inStock: true,
      },
      // Activations
      {
        name: "Activation Jumpsuit",
        description: "Versatile branded jumpsuit for activations and outdoor events. Comfortable for all-day wear with maximum branding space.",
        category: "Activations",
        price: 620,
        imagePrompt: "stylish women's jumpsuit, brand activation fashion, modern promotional outfit, bright outdoor photography",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["White", "Black", "Red", "Custom"],
        brandable: true,
        inStock: true,
      },
      {
        name: "Crop Top & Cargo Set",
        description: "Trendy crop top and cargo pants for music festivals, outdoor activations, and experiential marketing events.",
        category: "Activations",
        price: 490,
        imagePrompt: "crop top and cargo pants set, festival fashion, outdoor brand activation outfit, lifestyle product photography",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Khaki", "Black", "Olive", "White"],
        brandable: true,
        inStock: true,
      },
      // Fashion Shows
      {
        name: "Runway Silk Dress",
        description: "Luxurious silk midi dress designed for fashion show appearances. Elegant draping with a modern silhouette.",
        category: "Fashion Shows",
        price: 1800,
        imagePrompt: "luxurious silk midi dress, high fashion runway style, elegant draping, professional fashion photography, studio lighting",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Champagne", "Emerald", "Midnight Blue"],
        brandable: false,
        inStock: true,
      },
      {
        name: "Statement Power Suit",
        description: "Bold oversized power suit for fashion-forward events. Makes a statement on and off the runway.",
        category: "Fashion Shows",
        price: 1500,
        imagePrompt: "oversized power suit women's fashion, runway style, bold modern design, professional fashion photography",
        sizes: ["S", "M", "L"],
        colors: ["Hot Pink", "Electric Blue", "White"],
        brandable: false,
        inStock: true,
      },
    ];

    for (const outfit of outfits) {
      await ctx.db.insert("outfits", outfit);
    }
    return null;
  },
});

export const clearAllOutfits = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const outfits = await ctx.db.query("outfits").collect();
    for (const outfit of outfits) {
      await ctx.db.delete(outfit._id);
    }
    // Also clear orders
    const orders = await ctx.db.query("outfitOrders").collect();
    for (const order of orders) {
      await ctx.db.delete(order._id);
    }
    return outfits.length;
  },
});