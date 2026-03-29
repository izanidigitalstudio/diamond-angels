# 🚀 Quick Start - Resend Email Setup

## 30-Second Setup

### Step 1: Set Resend API Key (1 minute)

```bash
cd /Users/ccuser/Downloads/Diamong\ Angels
npx convex env set RESEND_API_KEY re_aRgCqwqR_LeNQwTEm9g5i1kvXyi4ANsE1
```

That's it! The API key is now configured.

---

### Step 2: Test It (2 minutes)

Open your Convex browser or any client and call:

```javascript
// Call the test function
await sendTestEmails({ testEmail: "izanidigitalstudio@gmail.com" })
```

Or use this direct call from Convex dashboard:

```typescript
import { api } from "./_generated/api";

const results = await api.email.sendTestEmails.run({
  testEmail: "izanidigitalstudio@gmail.com"
});

console.log(results);
```

### Step 3: Verify (1 minute)

Check **izanidigitalstudio@gmail.com** inbox. You should see 8 test emails:

1. ✓ Welcome Client
2. ✓ Welcome Talent
3. ✓ Welcome Admin
4. ✓ Booking Confirmation
5. ✓ Talent Booking Notification
6. ✓ Profile Approved
7. ✓ Profile Declined
8. ✓ Interest Expressed

---

## ✅ Done!

Your email system is now live. Emails will automatically be sent when:

- Users register (welcome email)
- Admins approve/decline talent (approval email)
- Admins confirm bookings (confirmation email)
- Talent expresses interest (notification email)

---

## API Key Details

- **Key**: `re_aRgCqwqR_LeNQwTEm9g5i1kvXyi4ANsE1`
- **Service**: Resend (https://resend.com)
- **Status**: Active ✓

---

## Next Steps

- 📧 Customize email templates in [convex/email.ts](convex/email.ts)
- 🎨 Change sender email address (currently: `system@diamondangels.co.za`)
- 📝 See [EMAIL_SETUP.md](EMAIL_SETUP.md) for full setup guide
- 📊 See [EMAIL_IMPLEMENTATION_SUMMARY.md](EMAIL_IMPLEMENTATION_SUMMARY.md) for details

---

## Troubleshooting

**API Key not working?**
```bash
npx convex env show
```
Should show: `RESEND_API_KEY = re_aRgCqwqR_LeNQwTEm9g5i1kvXyi4ANsE1`

**Emails not arriving?**
- Check Convex logs for errors
- Verify email address is correct
- Resend emails take 1-2 seconds to deliver

**Want to test a different email?**
```javascript
await sendTestEmails({ testEmail: "your-email@example.com" })
```

---

Feel free to reach out if you have any questions! 🎉
