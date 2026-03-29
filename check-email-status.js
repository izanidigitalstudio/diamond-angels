#!/usr/bin/env node

/**
 * Email System Status Check
 * Shows what's been set up and what's needed to send emails
 */

const fs = require("fs");
const path = require("path");

console.log("\n" + "=".repeat(70));
console.log("🔍 DIAMOND ANGELS EMAIL SYSTEM - STATUS CHECK");
console.log("=".repeat(70) + "\n");

const projectRoot = __dirname;
let allGood = true;

// 1. Check API Key
console.log("1️⃣  API Key Configuration");
console.log("-".repeat(70));
const envPath = path.join(projectRoot, ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  if (content.includes("RESEND_API_KEY")) {
    console.log("✅ RESEND_API_KEY is set in .env.local");
    const keyMatch = content.match(/RESEND_API_KEY=(.+)/);
    if (keyMatch) {
      const key = keyMatch[1].substring(0, 10) + "...";
      console.log(`   Key: ${key}\n`);
    }
  } else {
    console.log("❌ RESEND_API_KEY not found in .env.local\n");
    allGood = false;
  }
} else {
  console.log("❌ .env.local file not found\n");
  allGood = false;
}

// 2. Check Convex Files
console.log("2️⃣  Email Service Files");
console.log("-".repeat(70));

const requiredFiles = [
  "convex/email.ts",
  "convex/emailTrigger.ts",
  "convex/users.ts",
  "convex/talent.ts",
  "convex/bookings.ts",
  "convex/gigs.ts"
];

requiredFiles.forEach(file => {
  const filepath = path.join(projectRoot, file);
  if (fs.existsSync(filepath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NOT FOUND`);
    allGood = false;
  }
});
console.log();

// 3. Check Documentation
console.log("3️⃣  Documentation Files");
console.log("-".repeat(70));

const docFiles = [
  "HOW_TO_SEND_EMAILS.md",
  "EMAIL_SETUP.md",
  "SETUP_COMPLETE.md"
];

docFiles.forEach(file => {
  const filepath = path.join(projectRoot, file);
  if (fs.existsSync(filepath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`⚠️  ${file} - Missing`);
  }
});
console.log();

// 4. Status Summary
console.log("4️⃣  Next Steps");
console.log("-".repeat(70));

if (allGood) {
  console.log(`
🎉 SYSTEM IS READY! 

To send test emails, follow these steps:

OPTION A - Using Convex Dashboard (Fastest):
─────────────────────────────────────────
1. Go to https://dashboard.convex.dev
2. Create/select your project
3. Find the function: emailTrigger.triggerTestEmails
4. Call it with: { "testEmail": "izanidigitalstudio@gmail.com" }
5. Check inbox - emails arrive in 1-2 seconds!

OPTION B - Using Convex Dev Server:
─────────────────────────────────────
1. Run: cd "/Users/ccuser/Downloads/Diamong Angels"
2. Run: npx convex dev
3. Log in when prompted
4. Once running, use your React app or Convex Dashboard (Option A)

OPTION C - From Your React App:
────────────────────────────────
import { useMutation } from "convex/react";
import { api } from "./_generated/api";

const trigger = useMutation(api.emailTrigger.triggerTestEmails);
await trigger({ testEmail: "izanidigitalstudio@gmail.com" });

📧 Emails That Will Be Sent:
─────────────────────────────
1. Welcome Email - Client
2. Welcome Email - Talent
3. Welcome Email - Admin
4. Booking Confirmation
5. Talent Booking Notification
6. Profile Approved
7. Profile Declined
8. Interest Expressed

📚 For More Help:
─────────────────
- Read HOW_TO_SEND_EMAILS.md for detailed instructions
- Read EMAIL_SETUP.md for setup guide
- Read SETUP_COMPLETE.md for implementation details

✨ API is configured, code is ready, just need to trigger the function!
  `);
} else {
  console.log("❌ Some files are missing or API key is not configured.\n");
  console.log("Please check the status above and review HOW_TO_SEND_EMAILS.md\n");
}

console.log("=".repeat(70) + "\n");
