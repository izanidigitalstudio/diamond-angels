import { internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "system@diamondangels.co.za";

export const sendEmail = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    replyTo: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (_ctx, args) => {
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY in Convex environment variables.");
    }

    try {
      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: args.to,
          subject: args.subject,
          html: args.html,
          reply_to: args.replyTo,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Resend API error: ${data.message || response.statusText}`);
      }
      return data;
    } catch (error) {
      console.error("Email send error:", error);
      throw error;
    }
  },
});

// Email Templates
export const emailTemplates = {
  welcomeClient: (name: string, email: string): { subject: string; html: string } => ({
    subject: "Welcome to Diamond Angels",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Welcome to Diamond Angels, ${name}!</h1>
        <p>Thank you for creating an account with us.</p>
        <p>You can now:</p>
        <ul>
          <li>Post event gigs and book talent</li>
          <li>Manage your bookings and talent selections</li>
          <li>Receive notifications about gig updates</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br/>Diamond Angels Team</p>
      </div>
    `,
  }),

  welcomeTalent: (name: string, email: string): { subject: string; html: string } => ({
    subject: "Welcome to Diamond Angels",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Welcome to Diamond Angels, ${name}!</h1>
        <p>Thank you for creating an account with us.</p>
        <p>You can now:</p>
        <ul>
          <li>Complete your talent profile</li>
          <li>Browse available gigs</li>
          <li>Express interest in events</li>
          <li>Manage your bookings</li>
        </ul>
        <p>Please complete your profile to increase your visibility to clients.</p>
        <p>Best regards,<br/>Diamond Angels Team</p>
      </div>
    `,
  }),

  welcomeAdmin: (name: string, email: string): { subject: string; html: string } => ({
    subject: "Welcome to Diamond Angels Admin",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Welcome Admin, ${name}!</h1>
        <p>You have been granted admin access to Diamond Angels.</p>
        <p>Your access includes:</p>
        <ul>
          <li>Talent profile management</li>
          <li>Booking request approvals</li>
          <li>System administration</li>
        </ul>
        <p>Use your admin dashboard to manage the platform.</p>
        <p>Best regards,<br/>Diamond Angels Team</p>
      </div>
    `,
  }),

  bookingConfirmation: (
    clientName: string,
    eventType: string,
    eventDate: string,
    talentCount: number
  ): { subject: string; html: string } => ({
    subject: `Booking Confirmation - ${eventType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Booking Confirmed!</h1>
        <p>Dear ${clientName},</p>
        <p>Your booking has been confirmed:</p>
        <ul>
          <li><strong>Event Type:</strong> ${eventType}</li>
          <li><strong>Event Date:</strong> ${eventDate}</li>
          <li><strong>Talent Count:</strong> ${talentCount}</li>
        </ul>
        <p>You will receive further instructions closer to the event date.</p>
        <p>Best regards,<br/>Diamond Angels Team</p>
      </div>
    `,
  }),

  talentBookingNotif: (
    talentName: string,
    eventType: string,
    eventDate: string
  ): { subject: string; html: string } => ({
    subject: `You've Been Booked! - ${eventType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Congratulations, ${talentName}!</h1>
        <p>You have been booked for an event:</p>
        <ul>
          <li><strong>Event Type:</strong> ${eventType}</li>
          <li><strong>Event Date:</strong> ${eventDate}</li>
        </ul>
        <p>Please check your account for full details and any event requirements.</p>
        <p>Best regards,<br/>Diamond Angels Team</p>
      </div>
    `,
  }),

  profileApproved: (
    talentName: string
  ): { subject: string; html: string } => ({
    subject: "Your Profile Has Been Approved!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Profile Approved!</h1>
        <p>Dear ${talentName},</p>
        <p>Congratulations! Your talent profile has been approved and is now visible to clients.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse available gigs</li>
          <li>Express interest in events</li>
        </ul>
        <p>Best regards,<br/>Diamond Angels Team</p>
      </div>
    `,
  }),

  profileDeclined: (
    talentName: string,
    reason: string
  ): { subject: string; html: string } => ({
    subject: "Profile Review Decision",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Profile Review Decision</h1>
        <p>Dear ${talentName},</p>
        <p>Thank you for submitting your profile. Unfortunately, it was not approved at this time.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>You can update your profile and resubmit for review.</p>
        <p>Best regards,<br/>Diamond Angels Team</p>
      </div>
    `,
  }),

  interestExpressed: (
    clientName: string,
    talentName: string,
    eventType: string
  ): { subject: string; html: string } => ({
    subject: `Talent Interest - ${talentName} for ${eventType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Talent Interest Notification</h1>
        <p>Dear ${clientName},</p>
        <p><strong>${talentName}</strong> has expressed interest in your event:</p>
        <ul>
          <li><strong>Event Type:</strong> ${eventType}</li>
        </ul>
        <p>View their profile and decide if you'd like to proceed with booking them.</p>
        <p>Best regards,<br/>Diamond Angels Team</p>
      </div>
    `,
  }),
};

// Send welcome email based on role
export const sendWelcomeEmail = internalAction({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.string(),
    role: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    let template;
    switch (args.role) {
      case "client":
        template = emailTemplates.welcomeClient(args.name, args.email);
        break;
      case "talent":
        template = emailTemplates.welcomeTalent(args.name, args.email);
        break;
      case "admin":
        template = emailTemplates.welcomeAdmin(args.name, args.email);
        break;
      default:
        throw new Error("Unknown role");
    }

    return await ctx.runAction(sendEmail, {
      to: args.email,
      subject: template.subject,
      html: template.html,
    });
  },
});

// Individual email action handlers
export const sendProfileApprovedEmail = internalAction({
  args: {
    email: v.string(),
    talentName: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const template = emailTemplates.profileApproved(args.talentName);
    return await ctx.runAction(sendEmail, {
      to: args.email,
      subject: template.subject,
      html: template.html,
    });
  },
});

export const sendProfileDeclinedEmail = internalAction({
  args: {
    email: v.string(),
    talentName: v.string(),
    reason: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const template = emailTemplates.profileDeclined(args.talentName, args.reason);
    return await ctx.runAction(sendEmail, {
      to: args.email,
      subject: template.subject,
      html: template.html,
    });
  },
});

export const sendBookingConfirmationEmail = internalAction({
  args: {
    clientEmail: v.string(),
    clientName: v.string(),
    eventType: v.string(),
    eventDate: v.string(),
    talentCount: v.number(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const template = emailTemplates.bookingConfirmation(
      args.clientName,
      args.eventType,
      args.eventDate,
      args.talentCount
    );
    return await ctx.runAction(sendEmail, {
      to: args.clientEmail,
      subject: template.subject,
      html: template.html,
    });
  },
});

export const sendInterestExpressedEmail = internalAction({
  args: {
    clientEmail: v.string(),
    clientName: v.string(),
    talentName: v.string(),
    eventType: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const template = emailTemplates.interestExpressed(
      args.clientName,
      args.talentName,
      args.eventType
    );
    return await ctx.runAction(sendEmail, {
      to: args.clientEmail,
      subject: template.subject,
      html: template.html,
    });
  },
});

// Test function to send all email types
export const sendTestEmails = internalAction({
  args: {
    testEmail: v.string(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const results = [];

    try {
      // Welcome Client Email
      const welcomeClientTemplate = emailTemplates.welcomeClient("John Smith", args.testEmail);
      const welcomeClientResult = await ctx.runAction(sendEmail, {
        to: args.testEmail,
        subject: welcomeClientTemplate.subject,
        html: welcomeClientTemplate.html,
      });
      results.push({ type: "Welcome Client", status: "sent", result: welcomeClientResult });
    } catch (e: any) {
      results.push({ type: "Welcome Client", status: "failed", error: e.message });
    }

    try {
      // Welcome Talent Email
      const welcomeTalentTemplate = emailTemplates.welcomeTalent("Naledi Mokoena", args.testEmail);
      const welcomeTalentResult = await ctx.runAction(sendEmail, {
        to: args.testEmail,
        subject: welcomeTalentTemplate.subject,
        html: welcomeTalentTemplate.html,
      });
      results.push({ type: "Welcome Talent", status: "sent", result: welcomeTalentResult });
    } catch (e: any) {
      results.push({ type: "Welcome Talent", status: "failed", error: e.message });
    }

    try {
      // Welcome Admin Email
      const welcomeAdminTemplate = emailTemplates.welcomeAdmin("Admin User", args.testEmail);
      const welcomeAdminResult = await ctx.runAction(sendEmail, {
        to: args.testEmail,
        subject: welcomeAdminTemplate.subject,
        html: welcomeAdminTemplate.html,
      });
      results.push({ type: "Welcome Admin", status: "sent", result: welcomeAdminResult });
    } catch (e: any) {
      results.push({ type: "Welcome Admin", status: "failed", error: e.message });
    }

    try {
      // Booking Confirmation Email
      const bookingTemplate = emailTemplates.bookingConfirmation(
        "Sarah van der Merwe",
        "Fashion Show",
        "20 March 2025",
        8
      );
      const bookingResult = await ctx.runAction(sendEmail, {
        to: args.testEmail,
        subject: bookingTemplate.subject,
        html: bookingTemplate.html,
      });
      results.push({ type: "Booking Confirmation", status: "sent", result: bookingResult });
    } catch (e: any) {
      results.push({ type: "Booking Confirmation", status: "failed", error: e.message });
    }

    try {
      // Talent Booking Notification Email
      const talentBookingTemplate = emailTemplates.talentBookingNotif(
        "Naledi Mokoena",
        "Fashion Show",
        "20 March 2025"
      );
      const talentBookingResult = await ctx.runAction(sendEmail, {
        to: args.testEmail,
        subject: talentBookingTemplate.subject,
        html: talentBookingTemplate.html,
      });
      results.push({ type: "Talent Booking Notification", status: "sent", result: talentBookingResult });
    } catch (e: any) {
      results.push({ type: "Talent Booking Notification", status: "failed", error: e.message });
    }

    try {
      // Profile Approved Email
      const approvedTemplate = emailTemplates.profileApproved("Thandi Mabaso");
      const approvedResult = await ctx.runAction(sendEmail, {
        to: args.testEmail,
        subject: approvedTemplate.subject,
        html: approvedTemplate.html,
      });
      results.push({ type: "Profile Approved", status: "sent", result: approvedResult });
    } catch (e: any) {
      results.push({ type: "Profile Approved", status: "failed", error: e.message });
    }

    try {
      // Profile Declined Email
      const declinedTemplate = emailTemplates.profileDeclined(
        "Kayla September",
        "Photos do not meet quality standards"
      );
      const declinedResult = await ctx.runAction(sendEmail, {
        to: args.testEmail,
        subject: declinedTemplate.subject,
        html: declinedTemplate.html,
      });
      results.push({ type: "Profile Declined", status: "sent", result: declinedResult });
    } catch (e: any) {
      results.push({ type: "Profile Declined", status: "failed", error: e.message });
    }

    try {
      // Interest Expressed Email
      const interestTemplate = emailTemplates.interestExpressed(
        "Michael Dube",
        "Naledi Mokoena",
        "Summer Festival Promoters"
      );
      const interestResult = await ctx.runAction(sendEmail, {
        to: args.testEmail,
        subject: interestTemplate.subject,
        html: interestTemplate.html,
      });
      results.push({ type: "Interest Expressed", status: "sent", result: interestResult });
    } catch (e: any) {
      results.push({ type: "Interest Expressed", status: "failed", error: e.message });
    }

    return results;
  },
});
