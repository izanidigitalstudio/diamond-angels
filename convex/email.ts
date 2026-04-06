"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "re_aRgCqwqR_LeNQwTEm9g5i1kvXyi4ANsE1";
const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "Diamond Angels <access@diamondangels.co.za>";

export const sendEmail = internalAction({
  args: {
    to: v.union(v.string(), v.array(v.string())),
    subject: v.string(),
    html: v.string(),
    replyTo: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    id: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    const toAddresses = typeof args.to === "string" ? [args.to] : args.to;

    try {
      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: toAddresses,
          subject: args.subject,
          html: args.html,
          reply_to: args.replyTo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Resend API error:", JSON.stringify(data));
        return {
          success: false,
          error: data.message ?? `HTTP ${response.status}`,
        };
      }

      return { success: true, id: data.id };
    } catch (err: any) {
      console.error("Email send failed:", err.message);
      return { success: false, error: err.message };
    }
  },
});

// --- Email template helpers ---

export const sendBookingStatusEmail = internalAction({
  args: {
    clientEmail: v.string(),
    clientName: v.string(),
    eventType: v.string(),
    eventDate: v.string(),
    venue: v.string(),
    city: v.string(),
    status: v.string(),
    adminNotes: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    id: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const statusLabel = args.status === "confirmed" ? "Confirmed ✅"
      : args.status === "declined" ? "Declined"
      : args.status === "completed" ? "Completed"
      : args.status.charAt(0).toUpperCase() + args.status.slice(1);

    const statusColor = args.status === "confirmed" ? "#16a34a"
      : args.status === "declined" ? "#dc2626"
      : args.status === "completed" ? "#2563eb"
      : "#d97706";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#000;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
      <h1 style="color:#d4af37;margin:0;font-size:24px;">💎 Diamond Angels</h1>
    </div>
    <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <p style="color:#333;font-size:16px;">Hi ${args.clientName},</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Your booking request has been updated:
      </p>
      <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#888;font-size:14px;">Status</td>
            <td style="padding:8px 0;text-align:right;">
              <span style="background:${statusColor};color:#fff;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">
                ${statusLabel}
              </span>
            </td>
          </tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Event</td><td style="padding:8px 0;text-align:right;color:#333;font-size:14px;font-weight:500;">${args.eventType}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Date</td><td style="padding:8px 0;text-align:right;color:#333;font-size:14px;">${args.eventDate}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Venue</td><td style="padding:8px 0;text-align:right;color:#333;font-size:14px;">${args.venue}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">City</td><td style="padding:8px 0;text-align:right;color:#333;font-size:14px;">${args.city}</td></tr>
        </table>
      </div>
      ${args.adminNotes ? `<div style="background:#fffbeb;border-left:4px solid #d97706;padding:12px 16px;margin:16px 0;border-radius:0 8px 8px 0;"><p style="margin:0;color:#92400e;font-size:14px;"><strong>Note from Diamond Angels:</strong><br/>${args.adminNotes}</p></div>` : ""}
      ${args.status === "confirmed" ? `<p style="color:#555;font-size:15px;line-height:1.6;">We'll be in touch with further details about your event. If you have any questions, please don't hesitate to reach out.</p>` : ""}
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#999;font-size:12px;text-align:center;">Diamond Angels — Premium Event Staffing</p>
    </div>
  </div>
</body>
</html>`;

    return await ctx.runAction(internal.email.sendEmail, {
      to: args.clientEmail,
      subject: `Booking ${statusLabel} — ${args.eventType} | Diamond Angels`,
      html,
    });
  },
});

export const sendNewBookingNotification = internalAction({
  args: {
    adminEmail: v.string(),
    clientName: v.string(),
    clientCompany: v.string(),
    clientEmail: v.string(),
    clientPhone: v.string(),
    eventType: v.string(),
    eventDate: v.string(),
    venue: v.string(),
    city: v.string(),
    talentCount: v.number(),
    requirements: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    id: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#000;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
      <h1 style="color:#d4af37;margin:0;font-size:24px;">💎 Diamond Angels</h1>
      <p style="color:#fff;margin:8px 0 0;font-size:14px;">New Booking Request</p>
    </div>
    <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <p style="color:#333;font-size:16px;font-weight:600;">A new booking has been submitted:</p>
      <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:16px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Client</td><td style="padding:8px 0;text-align:right;color:#333;font-size:14px;font-weight:500;">${args.clientName}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Company</td><td style="padding:8px 0;text-align:right;color:#333;font-size:14px;">${args.clientCompany}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Email</td><td style="padding:8px 0;text-align:right;color:#333;font-size:14px;"><a href="mailto:${args.clientEmail}" style="color:#2563eb;">${args.clientEmail}</a></td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Phone</td><td style="padding:8px 0;text-align:right;color:#333;font-size:14px;"><a href="tel:${args.clientPhone}" style="color:#2563eb;">${args.clientPhone}</a></td></tr>
        </table>
      </div>
      <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:16px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Event Type</td><td style="padding:8px 0;text-align:right;color:#333;font-size:14px;font-weight:500;">${args.eventType}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Date</td><td style="padding:8px 0;text-align:right;color:#333;font-size:14px;">${args.eventDate}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Venue</td><td style="padding:8px 0;text-align:right;color:#333;font-size:14px;">${args.venue}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">City</td><td style="padding:8px 0;text-align:right;color:#333;font-size:14px;">${args.city}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Talent Needed</td><td style="padding:8px 0;text-align:right;color:#333;font-size:14px;font-weight:600;">${args.talentCount}</td></tr>
        </table>
      </div>
      <div style="background:#eff6ff;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 4px;color:#1e40af;font-size:13px;font-weight:600;">Requirements:</p>
        <p style="margin:0;color:#333;font-size:14px;line-height:1.5;">${args.requirements}</p>
      </div>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#999;font-size:12px;text-align:center;">Diamond Angels — Premium Event Staffing</p>
    </div>
  </div>
</body>
</html>`;

    return await ctx.runAction(internal.email.sendEmail, {
      to: args.adminEmail,
      subject: `New Booking: ${args.eventType} — ${args.clientName} | Diamond Angels`,
      html,
      replyTo: args.clientEmail,
    });
  },
});

export const sendTalentApprovalEmail = internalAction({
  args: {
    talentEmail: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    feedback: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    id: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#000;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
      <h1 style="color:#d4af37;margin:0;font-size:24px;">💎 Diamond Angels</h1>
    </div>
    <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="display:inline-block;background:#16a34a;color:#fff;padding:8px 24px;border-radius:24px;font-size:16px;font-weight:600;">Congratulations! 🎉</span>
      </div>
      <p style="color:#333;font-size:16px;">Hi ${args.firstName},</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        We are thrilled to let you know that your talent application has been <strong style="color:#16a34a;">approved</strong>!
      </p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Welcome to the Diamond Angels family. Your profile is now live and visible to our clients for bookings and event opportunities.
      </p>
      <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;margin:20px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0;color:#166534;font-size:14px;line-height:1.5;">
          <strong>What's next?</strong><br/>
          • Keep your profile and photos up to date<br/>
          • Check the app regularly for new gig opportunities<br/>
          • Respond promptly to booking requests
        </p>
      </div>
      ${args.feedback ? `<div style="background:#fffbeb;border-left:4px solid #d97706;padding:12px 16px;margin:16px 0;border-radius:0 8px 8px 0;"><p style="margin:0;color:#92400e;font-size:14px;"><strong>Note from Diamond Angels:</strong><br/>${args.feedback}</p></div>` : ""}
      <p style="color:#555;font-size:15px;line-height:1.6;">
        We look forward to working with you, ${args.firstName}!
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#999;font-size:12px;text-align:center;">Diamond Angels — Premium Event Staffing</p>
    </div>
  </div>
</body>
</html>`;

    return await ctx.runAction(internal.email.sendEmail, {
      to: args.talentEmail,
      subject: `Congratulations ${args.firstName}! Your Diamond Angels Application is Approved`,
      html,
    });
  },
});

export const sendTalentDeclineEmail = internalAction({
  args: {
    talentEmail: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    reason: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    id: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#000;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
      <h1 style="color:#d4af37;margin:0;font-size:24px;">💎 Diamond Angels</h1>
    </div>
    <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <p style="color:#333;font-size:16px;">Hi ${args.firstName},</p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Thank you for your interest in joining Diamond Angels. After reviewing your application, we regret to inform you that your profile has not been approved at this time.
      </p>
      <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;margin:20px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0;color:#991b1b;font-size:14px;line-height:1.5;">
          <strong>Reason:</strong><br/>${args.reason}
        </p>
      </div>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        You are welcome to update your profile and reapply. If you have any questions, please don't hesitate to reach out to us.
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#999;font-size:12px;text-align:center;">Diamond Angels — Premium Event Staffing</p>
    </div>
  </div>
</body>
</html>`;

    return await ctx.runAction(internal.email.sendEmail, {
      to: args.talentEmail,
      subject: `Diamond Angels Application Update — ${args.firstName} ${args.lastName}`,
      html,
    });
  },
});