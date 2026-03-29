import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Exposed mutation to trigger test emails
 * Can be called from client application
 */
export const triggerTestEmails = mutation({
  args: {
    testEmail: v.string(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    console.log(`[EMAIL TEST] Triggering test emails to: ${args.testEmail}`);
    
    const results = await ctx.runAction(internal.email.sendTestEmails, {
      testEmail: args.testEmail,
    });

    return results;
  },
});
