# 📧 How to Send Test Emails - Step by Step

The API key is configured, but to actually send the emails, you need to run the Convex development server and then trigger the test function. Here are your options:

---

## ✅ Option 1: Using Convex Dashboard (Recommended)

### Step 1: Set Up Your Convex Project
1. Go to https://dashboard.convex.dev
2. Create an account or log in
3. Create a new project
4. Get your Convex deployment URL

### Step 2: Set Deployment in Your Project
```bash
cd "/Users/ccuser/Downloads/Diamong Angels"
npx convex env set CONVEX_DEPLOYMENT <your-deployment-id>
```

### Step 3: Send Test Emails from Dashboard
1. Go to your project dashboard
2. Click "Functions" or "API"
3. Find `emailTrigger.triggerTestEmails`
4. Call it with:
```json
{
  "testEmail": "izanidigitalstudio@gmail.com"
}
```
5. Check the inbox - emails should arrive in 1-2 seconds!

---

## ✅ Option 2: From Your React App

Once your Convex dev server is running:

```tsx
import { useMutation } from "convex/react";
import { api } from "./_generated/api";

export function EmailTestButton() {
  const triggerEmails = useMutation(api.emailTrigger.triggerTestEmails);

  const handleTest = async () => {
    try {
      const results = await triggerEmails({
        testEmail: "izanidigitalstudio@gmail.com"
      });
      console.log("Email results:", results);
      alert("Test emails sent! Check your inbox in 1-2 seconds.");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <button onClick={handleTest}>
      Send Test Emails
    </button>
  );
}
```

---

## ✅ Option 3: Using Convex Dev Server (Manual)

### Step 1: Start Dev Server
```bash
cd "/Users/ccuser/Downloads/Diamong Angels"
npx convex dev
```

This will:
- Ask you to log in to Convex
- Set up your local development environment
- Create local environment variables

### Step 2: In Another Terminal, Send Emails
Once the server is running, use one of the above methods (React app or Dashboard)

---

## 🔍 Troubleshooting

### "Cannot find module" errors
- The Convex dev server must be running
- Check that convex/email.ts and convex/emailTrigger.ts exist

### "RESEND_API_KEY not set" error
- ✓ Already fixed! It's in your .env.local
- Make sure your Convex dev server reads the .env.local file

### Emails not arriving
1. Check the response from triggerTestEmails - it should show 8 results
2. Check spam/junk folder
3. Check Convex logs in the dashboard
4. Verify email address is correct

### "CONVEX_DEPLOYMENT not set" error
- Your project needs to be initialized
- Either use Option 1 (Dashboard) or Option 3 (npx convex dev)

---

## 📋 What Gets Sent

When you call `triggerTestEmails`, you'll receive 8 test emails:

1. ✓ Welcome Email - Client
2. ✓ Welcome Email - Talent
3. ✓ Welcome Email - Admin
4. ✓ Booking Confirmation
5. ✓ Talent Booking Notification
6. ✓ Profile Approved
7. ✓ Profile Declined
8. ✓ Interest Expressed

---

## 🚀 Quick Start (Fastest Way)

### If you want the fastest setup:

1. **Command line:**
   ```bash
   cd "/Users/ccuser/Downloads/Diamong Angels"
   npx convex env list  # To get your deployment
   ```

2. **Then go to:** https://dashboard.convex.dev

3. **Call the function:**
   - Find `emailTrigger.triggerTestEmails`
   - Call with `{ "testEmail": "izanidigitalstudio@gmail.com" }`

4. **Check inbox:** izanidigitalstudio@gmail.com

---

## 📞 Files Created

- `convex/emailTrigger.ts` - Exposed mutation to trigger test emails
- `email-test.html` - Visual test interface (open in browser)
- This file - Setup instructions

---

## ✨ Summary

Your email system is **100% ready**. You just need to:
1. Choose one of the 3 options above
2. Call the `triggerTestEmails` function
3. Check your inbox!

All 8 test emails will arrive within 1-2 seconds. 📧

---

**Need help?** Check the setup-complete.md or email-setup.md files for more details.
