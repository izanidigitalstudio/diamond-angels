"use node";

import { internalAction, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const CLICKATELL_API_KEY = "jLV69Rt5TYm-LgOpx1sbZw==";

// Format SA phone numbers to international format (27XXXXXXXXX)
function formatPhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "27" + cleaned.slice(1);
  }
  if (!cleaned.startsWith("27") && !cleaned.startsWith("+27")) {
    cleaned = "27" + cleaned;
  }
  cleaned = cleaned.replace(/^\+/, "");
  return cleaned;
}

// ---- Core: send a single SMS via Clickatell Platform HTTP API ----
export const sendSms = internalAction({
  args: {
    to: v.string(),
    content: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    messageId: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    const phone = formatPhone(args.to);
    
    // Try Clickatell Platform SMS HTTP API (simplest, most reliable)
    const url = `https://platform.clickatell.com/messages/http/send?apiKey=${encodeURIComponent(CLICKATELL_API_KEY)}&to=${phone}&content=${encodeURIComponent(args.content)}`;
    
    try {
      console.log(`[SMS] Sending to ${phone} via Clickatell HTTP API...`);
      const response = await fetch(url, { method: "GET" });
      const text = await response.text();
      console.log(`[SMS] Clickatell HTTP response (${response.status}):`, text);

      if (response.ok && !text.toLowerCase().includes("err")) {
        // Success - extract message ID if present
        const idMatch = text.match(/ID:\s*(\S+)/i);
        return { success: true, messageId: idMatch?.[1] ?? undefined };
      }

      // HTTP API failed, try the REST Platform API as fallback
      console.log("[SMS] HTTP API failed, trying REST Platform API...");
      const restResponse = await fetch("https://platform.clickatell.com/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: CLICKATELL_API_KEY,
        },
        body: JSON.stringify({
          content: args.content,
          to: [phone],
        }),
      });
      
      const restText = await restResponse.text();
      console.log(`[SMS] Clickatell REST response (${restResponse.status}):`, restText);
      
      if (restResponse.ok) {
        try {
          const data = JSON.parse(restText);
          const msgId = data.messages?.[0]?.apiMessageId ?? undefined;
          return { success: true, messageId: msgId };
        } catch {
          return { success: true };
        }
      }

      // REST API also failed, try One API as last resort
      console.log("[SMS] REST API failed, trying One API...");
      const oneApiResponse = await fetch("https://platform.clickatell.com/v1/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: CLICKATELL_API_KEY,
        },
        body: JSON.stringify({
          messages: [{ channel: "sms", to: phone, content: args.content }],
        }),
      });
      
      const oneApiText = await oneApiResponse.text();
      console.log(`[SMS] Clickatell One API response (${oneApiResponse.status}):`, oneApiText);
      
      if (oneApiResponse.ok) {
        try {
          const data = JSON.parse(oneApiText);
          const msgId = data.messages?.[0]?.apiMessageId ?? undefined;
          return { success: true, messageId: msgId };
        } catch {
          return { success: true };
        }
      }

      return {
        success: false,
        error: `All Clickatell APIs failed. HTTP: ${text.substring(0, 100)}, REST: ${restText.substring(0, 100)}, One: ${oneApiText.substring(0, 100)}`,
      };
    } catch (err: any) {
      console.error("[SMS] Send failed:", err.message);
      return { success: false, error: err.message };
    }
  },
});

// ---- Bulk: send SMS to multiple recipients ----
export const sendBulkSms = internalAction({
  args: {
    recipients: v.array(
      v.object({
        phone: v.string(),
        name: v.string(),
      })
    ),
    message: v.string(),
    personalise: v.optional(v.boolean()),
  },
  returns: v.object({
    sent: v.number(),
    failed: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const recipient of args.recipients) {
      const content = args.personalise
        ? args.message.replace(/\{name\}/g, recipient.name.split(" ")[0])
        : args.message;

      const result = await ctx.runAction(internal.sms.sendSms, {
        to: recipient.phone,
        content,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(`${recipient.name} (${recipient.phone}): ${result.error}`);
      }
    }

    return { sent, failed, errors };
  },
});

// ---- Admin: Send gig brief SMS to selected talent ----
export const sendGigBriefSms = action({
  args: {
    recipients: v.array(
      v.object({
        phone: v.string(),
        name: v.string(),
        profileId: v.optional(v.string()),
      })
    ),
    message: v.string(),
    gigTitle: v.optional(v.string()),
    channel: v.optional(v.string()),
  },
  returns: v.object({
    sent: v.number(),
    failed: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const result = await ctx.runAction(internal.sms.sendBulkSms, {
      recipients: args.recipients.map((r) => ({
        phone: r.phone,
        name: r.name,
      })),
      message: args.message,
      personalise: true,
    });

    // Log the SMS in the database
    try {
      await ctx.runMutation(internal.smsLog.logSmsSentInternal, {
        recipientCount: args.recipients.length,
        sent: result.sent,
        failed: result.failed,
        message: args.message,
        gigTitle: args.gigTitle,
        channel: args.channel ?? "sms",
      });
    } catch (logErr: any) {
      console.error("[SMS] Failed to log SMS:", logErr.message);
    }

    return result;
  },
});

// ---- Booking confirmation SMS to talent ----
export const sendBookingConfirmationSms = internalAction({
  args: {
    talentPhone: v.string(),
    talentName: v.string(),
    eventType: v.string(),
    eventDate: v.string(),
    venue: v.string(),
    city: v.string(),
    clientName: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const message =
      `Hi ${args.talentName.split(" ")[0]}, your booking has been CONFIRMED!\n\n` +
      `Event: ${args.eventType}\n` +
      `Date: ${args.eventDate}\n` +
      `Venue: ${args.venue}, ${args.city}\n` +
      (args.clientName ? `Client: ${args.clientName}\n` : "") +
      `\nPlease confirm your availability by replying to this SMS.\n\n` +
      `- Diamond Angels`;

    const result = await ctx.runAction(internal.sms.sendSms, {
      to: args.talentPhone,
      content: message,
    });

    return { success: result.success, error: result.error };
  },
});

// ---- Booking confirmation SMS to client ----
export const sendClientBookingConfirmationSms = internalAction({
  args: {
    clientPhone: v.string(),
    clientName: v.string(),
    eventType: v.string(),
    eventDate: v.string(),
    venue: v.string(),
    city: v.string(),
    status: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const statusText =
      args.status === "confirmed"
        ? "CONFIRMED"
        : args.status === "declined"
          ? "DECLINED"
          : args.status === "reviewed"
            ? "under REVIEW"
            : args.status.toUpperCase();

    const message =
      `Hi ${args.clientName.split(" ")[0]}, your Diamond Angels booking has been ${statusText}.\n\n` +
      `Event: ${args.eventType}\n` +
      `Date: ${args.eventDate}\n` +
      `Venue: ${args.venue}, ${args.city}\n` +
      (args.status === "confirmed"
        ? `\nWe'll be in touch with further details. Thank you for choosing Diamond Angels!`
        : args.status === "declined"
          ? `\nPlease contact us for more information.`
          : `\nWe'll update you shortly.`) +
      `\n\n- Diamond Angels`;

    const result = await ctx.runAction(internal.sms.sendSms, {
      to: args.clientPhone,
      content: message,
    });

    return { success: result.success, error: result.error };
  },
});
