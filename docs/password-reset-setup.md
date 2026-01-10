# Password Reset Feature - Setup Guide

## Implementation Complete ✅

The password reset feature has been successfully implemented using Firebase Authentication's built-in password reset flow.

## What Was Implemented

### 1. New Files Created
- `src/components/auth/ForgotPasswordForm.tsx` - UI component for password reset requests

### 2. Files Modified
- `src/components/auth/types.ts` - Added `'forgot-password'` to `AuthMode` type
- `src/components/auth/hooks/useAuth.ts` - Added `handlePasswordReset()` function
- `src/components/auth/SignInForm.tsx` - Added "Forgot password?" link
- `src/components/auth/AuthForm.tsx` - Added forgot-password mode rendering
- `src/components/auth/index.ts` - Exported new component
- `messages/en.json` - Added English translations for password reset
- `messages/es.json` - Added Spanish translations for password reset

## Firebase Console Configuration Required

Before the feature will work in production, you need to configure the following in the [Firebase Console](https://console.firebase.google.com):

### Step 1: Verify Email/Password Authentication is Enabled
1. Go to **Authentication** → **Sign-in method**
2. Ensure **Email/Password** provider is **enabled** ✅

### Step 2: Customize Password Reset Email Template
1. Go to **Authentication** → **Templates** tab
2. Click on **Password reset** template
3. Customize the following:
   - **Sender name**: `Toulmin Lab` (or your preferred name)
   - **Subject**: Customize if desired (default is fine)
   - **Action URL**: Leave as default (Firebase-hosted page) for security
   - You can customize the email HTML/text if desired

### Step 3: Verify Authorized Domains
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Ensure these domains are listed:
   - `localhost` (for development)
   - Your production domain (e.g., `toulmin-lab.com`)
   - Your Vercel deployment domain (e.g., `your-app.vercel.app`)

### Step 4: (Optional) Configure Custom SMTP
By default, Firebase sends emails from `noreply@<your-project>.firebaseapp.com`.

To use a custom email address (e.g., `noreply@toulmin-lab.com`):
1. Upgrade to Firebase Blaze (pay-as-you-go) plan
2. Go to **Authentication** → **Templates** → **SMTP settings**
3. Configure your SMTP server credentials

## How It Works

### User Flow
1. User clicks "Forgot password?" on sign-in page
2. User enters their email address
3. User clicks "Send reset link"
4. Firebase sends an email with a password reset link
5. User clicks the link in their email
6. User is redirected to a Firebase-hosted page to enter a new password
7. After resetting, user can sign in with their new password

### Security Features Implemented
✅ **No user enumeration**: The app shows the same success message whether the email exists or not  
✅ **Rate limiting**: Firebase automatically rate-limits password reset requests  
✅ **Secure tokens**: Firebase generates and validates time-limited, single-use tokens  
✅ **Error handling**: Proper handling of all Firebase error codes

### Code Example
The implementation uses Firebase's `sendPasswordResetEmail()` function:

```typescript
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

await sendPasswordResetEmail(auth, email);
```

## Testing the Feature

### Local Development Testing
1. Start your development server: `pnpm dev`
2. Navigate to `/auth`
3. Click "Forgot password?"
4. Enter a test email address that exists in Firebase Auth
5. Check the email inbox for the reset link

### What to Expect
- **Success**: Generic message "If an account exists for this email, you will receive a reset link shortly."
- **Invalid email format**: "Invalid email format"
- **Too many requests**: "Too many password reset attempts. Please wait a moment and try again."

### Testing the Email Flow
For development testing, Firebase will send real emails. Make sure:
1. You're using a real email address you can access
2. Check spam/junk folders if email doesn't arrive
3. The reset link will redirect to Firebase's hosted password reset page

## Alternative Implementation (Not Recommended for Now)

If you later want users to reset their password within your own app UI instead of the Firebase-hosted page:

1. Create a new page: `src/app/(public)/auth/reset-password/page.tsx`
2. Use `confirmPasswordReset(auth, oobCode, newPassword)` to complete the reset
3. Extract the `oobCode` parameter from the URL
4. Build a form for the user to enter their new password

This adds complexity without significant benefit for most use cases.

## Troubleshooting

### Email Not Arriving
- Check Firebase Console → Authentication → Users to verify email exists
- Check spam/junk folder
- Verify SMTP settings if using custom email
- Check Firebase Console → Usage for any quota limits

### "Invalid Action Code" Error
- Reset link expired (default: 1 hour)
- Link was already used
- Link was malformed or corrupted

### Rate Limiting Errors
- Firebase automatically rate-limits requests
- Wait a few minutes before trying again
- This is a security feature to prevent abuse

## Translation Keys Added

### English (en.json)
- `pages.auth.resetPassword`
- `pages.auth.resetPasswordHeading`
- `pages.auth.resetPasswordDescription`
- `pages.auth.sendResetLink`
- `pages.auth.sendingResetLink`
- `pages.auth.resetLinkSent`
- `pages.auth.backToSignIn`
- `errors.auth.resetFailed`
- `errors.auth.tooManyRequests`

### Spanish (es.json)
Same keys with Spanish translations.

## Next Steps

1. ✅ Test the feature locally
2. ✅ Configure Firebase Console settings (see above)
3. ✅ Test in production after deployment
4. ✅ Monitor Firebase Console for any email delivery issues
5. (Optional) Customize the email template branding

## Support

If you encounter any issues:
1. Check Firebase Console → Authentication → Users
2. Check Firebase Console → Usage for any quota limits
3. Review Firebase Console logs for errors
4. Ensure all environment variables are set correctly
