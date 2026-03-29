/**
 * Email Testing Helper
 * 
 * This file shows how to test the email system.
 * Run this to send test emails to a specified address.
 */

// Option 1: Call from a React component
// ==========================================
import { useMutation } from "convex/react";
import { api } from "./_generated/api";

export function EmailTestButton() {
  const sendTestEmails = useMutation(api.email.sendTestEmails);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSendTests = async () => {
    setLoading(true);
    try {
      const testResults = await sendTestEmails({
        testEmail: "izanidigitalstudio@gmail.com"
      });
      setResults(testResults);
      console.log("Test Results:", testResults);
      
      // Display results
      const passed = testResults.filter((r: any) => r.status === "sent").length;
      const failed = testResults.filter((r: any) => r.status === "failed").length;
      alert(`Email Test Results:\n✓ Sent: ${passed}\n✗ Failed: ${failed}`);
    } catch (error) {
      console.error("Test failed:", error);
      alert("Email test failed: " + (error as Error).message);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleSendTests} 
      disabled={loading}
      style={{
        padding: "10px 20px",
        backgroundColor: "#2c3e50",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? "Sending Test Emails..." : "Send Test Emails"}
    </button>
  );
}


// Option 2: Call directly from Convex (for admin purposes)
// ========================================================
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const triggerTestEmails = mutation({
  args: {
    testEmail: v.optional(v.string()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Only allow admins to trigger test emails
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new Error("Admin only");
    }

    const email = args.testEmail || "izanidigitalstudio@gmail.com";
    
    console.log(`[EMAIL TEST] Sending test emails to: ${email}`);
    const results = await ctx.runAction(internal.email.sendTestEmails, {
      testEmail: email,
    });

    return results;
  },
});


// Expected Results
// ================
// When successful, you should receive 8 emails:
// 
// 1. ✓ Welcome Client
// 2. ✓ Welcome Talent  
// 3. ✓ Welcome Admin
// 4. ✓ Booking Confirmation
// 5. ✓ Talent Booking Notification
// 6. ✓ Profile Approved
// 7. ✓ Profile Declined
// 8. ✓ Interest Expressed
//
// Check izanidigitalstudio@gmail.com to verify all emails arrived.


// Troubleshooting
// ================
// If emails aren't sending:
// 1. Check that RESEND_API_KEY is set in Convex environment
// 2. Check Convex logs for errors
// 3. Verify the email address is valid
// 4. Make sure you're authenticated and are an admin (for the mutation)
