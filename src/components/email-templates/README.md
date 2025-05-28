# Email Templates

This directory contains React-based email templates for the Toulmin Lab application.

## Overview

Email templates are built using React components and sent via [Resend](https://resend.com/). All templates support multi-language functionality using centralized translations from the `messages/` directory and are designed to be responsive across different email clients.

## Templates

### UserInvitationEmail

**Purpose**: Sent when a new user is invited to join the platform by an administrator.

**Features**:
- Multi-language support using centralized translations (English and Spanish)
- Server-side rendering with next-intl translations
- Responsive design optimized for email clients
- Includes temporary password (if generated)
- Role-specific messaging with proper translations
- Platform feature highlights
- Direct login link

**Props**:
- `inviterName`: Name of the person who sent the invitation
- `userRole`: Role assigned to the new user
- `temporaryPassword`: Generated temporary password (optional)
- `locale`: Language code ('en' or 'es')

**Note**: This component is async and uses server-side translations from `messages/[locale].json` files.

## Usage

Email templates are automatically used by the email service when sending invitations. The locale is automatically detected using next-intl's built-in locale detection:

```typescript
import { sendUserInvitation } from '@/lib/services/email';

await sendUserInvitation(
  'user@example.com',
  'Admin Name',
  'user',
  'temp123',
  'en' // Locale is automatically detected using getLocale()
);
```

## Translations

All email content is now centralized in the translation files:

- **English**: `messages/en.json` under `email.invitation.*`
- **Spanish**: `messages/es.json` under `email.invitation.*`
- **Role translations**: Available under `admin.users.roles.*`

This ensures consistency across the application and makes it easier to maintain translations.

## Development Guidelines

1. **Server-side Components**: Email templates are async and use server-side next-intl translations
2. **Inline Styles**: Use inline styles for maximum email client compatibility
3. **Responsive Design**: Ensure templates work on both desktop and mobile email clients
4. **Accessibility**: Include proper alt text and semantic HTML structure
5. **Testing**: Test templates across different email clients before deployment
6. **Translations**: Add new language support by extending the translation files in `messages/`

## Email Client Compatibility

Templates are designed to work with:
- Gmail (Web, iOS, Android)
- Outlook (Web, Desktop, Mobile)
- Apple Mail
- Yahoo Mail
- Thunderbird

## Adding New Templates

1. Create a new async React component in this directory
2. Use `getTranslations` from `next-intl/server` for translations
3. Follow the existing pattern for styling and structure
4. Add translations to the appropriate `messages/[locale].json` files
5. Export the component for use in the email service
6. Update this README with template documentation

## Locale Detection

The email language is automatically determined using next-intl's `getLocale()` function, which follows the hierarchy defined in `src/i18n/request.ts`:

1. **Cookie**: `NEXT_LOCALE` cookie set by the LanguageSwitcher
2. **Headers**: Browser's `Accept-Language` header
3. **Default**: Falls back to English ('en')

This ensures consistency with the rest of the application's locale handling and that invitation emails are sent in the language preferred by the admin who is creating the user account.

## Architecture Benefits

- **Consistency**: Uses the same locale detection as `useLocale()` in client components
- **Maintainability**: Single source of truth for locale detection logic
- **Reliability**: Leverages next-intl's robust locale detection system
- **Simplicity**: No manual cookie parsing or duplicate logic 