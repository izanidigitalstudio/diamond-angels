import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

export const listAllMembers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("members"),
      _creationTime: v.number(),
      name: v.string(),
      company: v.optional(v.string()),
      role: v.optional(v.string()),
      category: v.string(),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      city: v.optional(v.string()),
      notes: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const members = await ctx.db.query("members").collect();
    return members.map((m: Doc<"members">) => ({
      _id: m._id,
      _creationTime: m._creationTime,
      name: m.name,
      company: m.company,
      role: m.role,
      category: m.category,
      phone: m.phone,
      email: m.email,
      city: m.city,
      notes: m.notes,
    }));
  },
});

export const addMember = mutation({
  args: {
    name: v.string(),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    category: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    city: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("members"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("members", {
      name: args.name,
      company: args.company,
      role: args.role,
      category: args.category,
      phone: args.phone,
      email: args.email,
      city: args.city,
      notes: args.notes,
    });
  },
});

export const updateMember = mutation({
  args: {
    id: v.id("members"),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    city: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Member not found");
    await ctx.db.patch(id, {
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.company !== undefined ? { company: updates.company } : {}),
      ...(updates.role !== undefined ? { role: updates.role } : {}),
      ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
      ...(updates.email !== undefined ? { email: updates.email } : {}),
      ...(updates.city !== undefined ? { city: updates.city } : {}),
      ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
    });
    return null;
  },
});

export const bulkImportMembers = mutation({
  args: {
    members: v.array(
      v.object({
        name: v.string(),
        company: v.optional(v.string()),
        role: v.optional(v.string()),
        category: v.string(),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        city: v.optional(v.string()),
      })
    ),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    let count = 0;
    for (const member of args.members) {
      await ctx.db.insert("members", {
        name: member.name,
        company: member.company,
        role: member.role,
        category: member.category,
        phone: member.phone,
        email: member.email,
        city: member.city,
      });
      count++;
    }
    return count;
  },
});

export const deleteMember = mutation({
  args: { id: v.id("members") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});