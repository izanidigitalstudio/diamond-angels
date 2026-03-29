#!/usr/bin/env node

/**
 * Standalone Email Sender
 * Uses Resend API directly to send all 8 test emails
 */

const https = require("https");
require("dotenv").config({ path: ".env.local" });

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TEST_EMAIL = "izanidigitalstudio@gmail.com";

if (!RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY not found in .env.local");
    process.exit(1);
}

// Email templates
const emailTemplates = {
    welcomeClient: {
        subject: "Welcome to Diamond Angels",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Welcome to Diamond Angels, John Smith!</h1>
                <p>Thank you for creating an account with us.</p>
                <p>You can now:</p>
                <ul>
                    <li>Post event gigs and book talent</li>
                    <li>Manage your bookings and talent selections</li>
                    <li>Receive notifications about gig updates</li>
                </ul>
                <p>Best regards,<br/>Diamond Angels Team</p>
            </div>
        `,
    },
    welcomeTalent: {
        subject: "Welcome to Diamond Angels",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Welcome to Diamond Angels, Naledi Mokoena!</h1>
                <p>Thank you for creating an account with us.</p>
                <p>You can now:</p>
                <ul>
                    <li>Complete your talent profile</li>
                    <li>Browse available gigs</li>
                    <li>Express interest in events</li>
                    <li>Manage your bookings</li>
                </ul>
                <p>Best regards,<br/>Diamond Angels Team</p>
            </div>
        `,
    },
    welcomeAdmin: {
        subject: "Welcome to Diamond Angels Admin",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Welcome Admin, Admin User!</h1>
                <p>You have been granted admin access to Diamond Angels.</p>
                <p>Your access includes:</p>
                <ul>
                    <li>Talent profile management</li>
                    <li>Booking request approvals</li>
                    <li>System administration</li>
                </ul>
                <p>Best regards,<br/>Diamond Angels Team</p>
            </div>
        `,
    },
    bookingConfirmation: {
        subject: "Booking Confirmation - Fashion Show",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Booking Confirmed!</h1>
                <p>Dear Sarah van der Merwe,</p>
                <p>Your booking has been confirmed:</p>
                <ul>
                    <li><strong>Event Type:</strong> Fashion Show</li>
                    <li><strong>Event Date:</strong> 20 March 2025</li>
                    <li><strong>Talent Count:</strong> 8</li>
                </ul>
                <p>Best regards,<br/>Diamond Angels Team</p>
            </div>
        `,
    },
    talentBookingNotification: {
        subject: "You've Been Booked! - Fashion Show",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Congratulations, Naledi Mokoena!</h1>
                <p>You have been booked for an event:</p>
                <ul>
                    <li><strong>Event Type:</strong> Fashion Show</li>
                    <li><strong>Event Date:</strong> 20 March 2025</li>
                </ul>
                <p>Best regards,<br/>Diamond Angels Team</p>
            </div>
        `,
    },
    profileApproved: {
        subject: "Your Profile Has Been Approved!",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Profile Approved!</h1>
                <p>Dear Thandi Mabaso,</p>
                <p>Congratulations! Your talent profile has been approved and is now visible to clients.</p>
                <p>Best regards,<br/>Diamond Angels Team</p>
            </div>
        `,
    },
    profileDeclined: {
        subject: "Profile Review Decision",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Profile Review Decision</h1>
                <p>Dear Kayla September,</p>
                <p>Thank you for submitting your profile. Unfortunately, it was not approved at this time.</p>
                <p><strong>Reason:</strong> Photos do not meet quality standards</p>
                <p>Best regards,<br/>Diamond Angels Team</p>
            </div>
        `,
    },
    interestExpressed: {
        subject: "Talent Interest - Naledi Mokoena for Summer Festival Promoters",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Talent Interest Notification</h1>
                <p>Dear Michael Dube,</p>
                <p><strong>Naledi Mokoena</strong> has expressed interest in your event:</p>
                <ul>
                    <li><strong>Event Type:</strong> Summer Festival Promoters</li>
                </ul>
                <p>Best regards,<br/>Diamond Angels Team</p>
            </div>
        `,
    },
};

function sendEmail(templateName, template) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            from: "system@diamondangels.co.za",
            to: TEST_EMAIL,
            subject: template.subject,
            html: template.html,
        });

        const options = {
            hostname: "api.resend.com",
            path: "/emails",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": data.length,
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
        };

        const req = https.request(options, (res) => {
            let responseData = "";
            res.on("data", (chunk) => {
                responseData += chunk;
            });
            res.on("end", () => {
                try {
                    const parsed = JSON.parse(responseData);
                    if (res.statusCode === 200) {
                        resolve({ templateName, status: "sent", id: parsed.id });
                    } else {
                        reject({ templateName, status: "failed", error: parsed.message });
                    }
                } catch (e) {
                    reject({ templateName, status: "failed", error: responseData });
                }
            });
        });

        req.on("error", (error) => {
            reject({ templateName, status: "failed", error: error.message });
        });

        req.write(data);
        req.end();
    });
}

async function sendAllTestEmails() {
    console.log("\n📧 Sending Test Emails to Diamond Angels System\n");
    console.log(`📬 Email Address: ${TEST_EMAIL}`);
    console.log("─".repeat(70));

    const results = [];
    const templates = Object.entries(emailTemplates);

    for (const [key, template] of templates) {
        process.stdout.write(`Sending ${key}... `);
        try {
            const result = await sendEmail(key, template);
            console.log(`✅`);
            results.push(result);
        } catch (error) {
            console.log(`❌`);
            results.push(error);
        }
    }

    console.log("─".repeat(70));
    console.log("\n📊 Results:");
    console.log("─".repeat(70));

    results.forEach((result) => {
        const icon = result.status === "sent" ? "✓" : "✗";
        console.log(`${icon} ${result.templateName}: ${result.status}`);
        if (result.error) {
            console.log(`  Error: ${result.error}`);
        }
    });

    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "failed").length;

    console.log("\n" + "─".repeat(70));
    console.log(`\n🎉 Summary: ${sent}/${templates.length} emails sent successfully`);

    if (failed > 0) {
        console.log(`⚠️  ${failed} email(s) failed`);
    } else {
        console.log("\n✅ All test emails sent! Check your inbox in 1-2 seconds.");
    }

    console.log("\n");
}

sendAllTestEmails().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
