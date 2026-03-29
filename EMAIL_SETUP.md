# Email Service Setup Guide

## Overview
Diamond Angels has been integrated with Resend API for email sending. The system will automatically send emails for:

- User registration (welcome emails)
- Profile approvals/declines (for talent)
- Booking confirmations (for clients)
- Talent interest notifications (when talent expresses interest in a gig)

## Setup Instructions

### 1. Add Resend API Key to Convex Environment

The Resend API key needs to be stored in your Convex environment variables.

#### Option A: Using `.env.local` (Development)

Create a `.env.local` file in the root of your project:

```
RESEND_API_KEY=re_aRgCqwqR_LeNQwTEm9g5i1kvXyi4ANsE1
```

Then push to Convex:
```bash
npx convex env set RESEND_API_KEY re_aRgCqwqR_LeNQwTEm9g5i1kvXyi4ANsE1
```

#### Option B: Using Convex Dashboard

1. Go to your Convex project dashboard: https://dashboard.convex.dev
2. Navigate to Environment Variables
3. Set `RESEND_API_KEY` to your API key: `re_aRgCqwqR_LeNQwTEm9g5i1kvXyi4ANsE1`

### 2. Verify Email Setup

Once the API key is set, the email service will automatically:

- Send welcome emails when users register and set their role
- Send profile approval/decline emails when admins review talent profiles
- Send booking confirmation emails when admins confirm bookings
- Send talent interest notifications when talent expresses interest in gigs

## Testing Email Sending

### Run Test Emails

To test all email types, you can call the test function from your Convex backend:

```typescript
// From your client code or a mutation
import { api } from "./_generated/api";
import { useMutation } from "convex/react";

export function TestEmailButton() {
  const sendTestEmails = useMutation(api.email.sendTestEmails);

  const handleTest = async () => {
    const results = await sendTestEmails({
      testEmail: "izanidigitalstudio@gmail.com"
    });
    console.log("Test results:", results);
  };

  return <button onClick={handleTest}>Send Test Emails</button>;
}
```

### Email Types Tested

The test function sends all 8 system email types:

1. **Welcome Email - Client** - Sent when a client registers
2. **Welcome Email - Talent** - Sent when a talent registers  
3. **Welcome Email - Admin** - Sent when an admin is created
4. **Booking Confirmation** - Sent when admin confirms a booking
5. **Talent Booking Notification** - Sent when talent is booked
6. **Profile Approved** - Sent when talent profile is approved
7. **Profile Declined** - Sent when talent profile is rejected
8. **Interest Expressed** - Sent when talent expresses interest in a gig

### Checking Email Delivery

After running tests, check the test email inbox at **izanidigitalstudio@gmail.com** to verify all emails arrived successfully.

## Email Customization

Edit email templates in [convex/email.ts](convex/email.ts):

```typescript
welcomeClient: (name: string, email: string) => ({
  subject: "Welcome to Diamond Angels",
  html: `<div>...</div>`,
}),

welcomeTalent: (name: string, email: string) => ({
  subject: "Welcome to Diamond Angels",
  html: `<div>...</div>`,
}),

// ... other templates
```

You can customize:
- Subject lines
- HTML content
- Sender email (currently `system@diamondangels.co.za`)

## Important Notes

- ⚠️ **Keep API key private** - Never commit the `.env.local` file to version control
- The API key is already configured by the development team
- Emails are sent asynchronously via Convex scheduler
- Failed emails will be logged in Convex logs
- Check Convex logs if emails aren't being delivered: https://dashboard.convex.dev/logs

## Troubleshooting

### Emails not sending?

1. Verify `RESEND_API_KEY` is set in Convex environment variables
2. Check Convex logs for errors
3. Ensure the user's email address is valid
4. Test with the `sendTestEmails` function

### Wrong email address?

Update email templates and sender address in [convex/email.ts](convex/email.ts):

```typescript
const FROM_EMAIL = "system@diamondangels.co.za"; // Change this
```

### Too many test emails?

You can delete them from `izanidigitalstudio@gmail.com` or change the test email to a different address when calling `sendTestEmails({ testEmail: "your-email@example.com" })`.

## Next Steps

1. ✅ Set the `RESEND_API_KEY` in Convex environment variables
2. ✅ Test email sending to `izanidigitalstudio@gmail.com`
3. ✅ Verify all 8 email types arrive successfully
4. ✅ Update email sender address if needed
5. ✅ Deploy to production

---

**Need help?** Check the Convex documentation: https://docs.convex.dev
