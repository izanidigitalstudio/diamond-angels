#!/usr/bin/env node

/**
 * Quick test script to send test emails via Convex
 */

import { ConvexClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const client = new ConvexClient(process.env.VITE_CONVEX_URL || "https://damp-panda-123.convex.cloud");

async function sendTestEmails() {
  try {
    console.log("🚀 Sending test emails to izanidigitalstudio@gmail.com...");
    
    const results = await client.action(api.email.sendTestEmails, {
      testEmail: "izanidigitalstudio@gmail.com"
    });

    console.log("\n✅ Test email results:\n");
    results.forEach((result, index) => {
      const icon = result.status === "sent" ? "✓" : "✗";
      console.log(`${icon} ${result.type}: ${result.status}`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
    });

    const sent = results.filter(r => r.status === "sent").length;
    const failed = results.filter(r => r.status === "failed").length;
    console.log(`\n📊 Summary: ${sent} sent, ${failed} failed\n`);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

sendTestEmails();
