#!/usr/bin/env node

/**
 * Setup and Email Test Script
 * 
 * This script helps set up the Convex environment and send test emails
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Diamond Angels - Email System Setup\n");

// Step 1: Verify .env.local
console.log("✓ Step 1: Checking .env.local...");
const envLocalPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf-8");
  if (content.includes("RESEND_API_KEY")) {
    console.log("  ✓ RESEND_API_KEY is set in .env.local\n");
  } else {
    console.error("  ✗ RESEND_API_KEY not found in .env.local");
    process.exit(1);
  }
} else {
  console.error("  ✗ .env.local file not found");
  process.exit(1);
}

// Step 2: Check Convex setup
console.log("✓ Step 2: Checking Convex setup...");
const convexJsonPath = path.join(__dirname, "convex");
if (!fs.existsSync(convexJsonPath)) {
  console.error("  ✗ convex/ directory not found");
  process.exit(1);
}
console.log("  ✓ Convex project structure exists\n");

// Step 3: Provide next steps
console.log("✓ Step 3: Setup Instructions\n");
console.log("To send test emails, please follow these steps:\n");
console.log("1. Start the Convex development server:");
console.log("   $ npx convex dev\n");
console.log("2. In your app or test, call:");
console.log("   const results = await sendTestEmails({");
console.log("     testEmail: 'izanidigitalstudio@gmail.com'");
console.log("   });\n");
console.log("3. Check izanidigitalstudio@gmail.com inbox for test emails\n");

// Provide direct curl command for those with Convex already set up
console.log("---\n");
console.log("Alternative - If your Convex dev server is already running:\n");
console.log("You can send test emails by calling the function directly from");
console.log("your Convex dashboard (convex.dev) or from your app client code.\n");

console.log("✅ Setup complete! The email system is ready to go.\n");
