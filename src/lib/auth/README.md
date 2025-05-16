# Authentication System

This directory contains the authentication system for the Toulmin Lab application. It uses Next-Auth integrated with Firebase Authentication to provide both email/password and Google authentication methods.

## Key Components

### `auth.ts`

Main Next-Auth configuration file with:
- Credentials provider (email/password)
- Google provider
- JWT session handling
- Custom callbacks for token and session management

### `firebase.ts`

Firebase Admin SDK integration for:
- Token verification
- User role management
- Custom claims handling

### `google.ts`

Client-side utilities for Google authentication:
- `signInWithGoogle`: Direct Firebase authentication with Google
- `linkAccountWithGoogle`: Link existing accounts with Google
- `handleGoogleAuth`: Process Google OAuth tokens

### `middleware.ts`

API route protection with:
- Authentication verification
- Role-based access control
- Admin-only route protection

### `utils.ts`

Helper utilities for authentication-related tasks

## Setup Requirements

1. Environment variables:
   ```
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email@example.com
   FIREBASE_PRIVATE_KEY="your-private-key-with-quotes"
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

2. Firebase Project Configuration:
   - Enable Email/Password authentication
   - Enable Google authentication
   - Configure allowed domains in Firebase console

## Usage Examples

### Protected Component
```tsx
'use client';

import { useSession } from 'next-auth/react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <h1>Protected Content</h1>
      <p>Only authenticated users can see this.</p>
    </ProtectedRoute>
  );
}
```

### Sign In with Google
```tsx
'use client';

import { signIn } from 'next-auth/react';

export function GoogleSignInButton() {
  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/' });
  };
  
  return (
    <button onClick={handleGoogleSignIn}>
      Sign in with Google
    </button>
  );
}
```

### Access User Role
```tsx
'use client';

import { useSession } from 'next-auth/react';
import { Role } from '@/types/roles';

export function RoleBasedComponent() {
  const { data: session } = useSession();
  const userRole = session?.user?.role as Role;
  
  if (userRole === Role.ADMIN) {
    return <AdminPanel />;
  }
  
  return <RegularUserContent />;
}
```

## Security Considerations

1. All JWT tokens are stored in HTTP-only cookies
2. Server-side validation of tokens via Firebase Admin SDK
3. Role-based access control for protected routes
4. Short-lived tokens with refresh capability 