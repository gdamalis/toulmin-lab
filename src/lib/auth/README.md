# Authentication System

This directory contains the authentication system for the Toulmin Lab application. It implements a dual authentication approach using Firebase Authentication for user management and NextAuth for session handling.

## Architecture Overview

The authentication system uses:
- **Firebase Authentication**: Email/password and Google provider
- **NextAuth.js**: Session management and JWT handling
- **Context API**: Global authentication state via AuthContext

## Key Components

### Core Authentication Files

#### `authorize.ts`
Server-side role-based access control helper for protecting routes and pages.

#### `firebase.ts`
Firebase Admin SDK integration for:
- Token verification
- User role management via custom claims
- User data retrieval

#### `google.ts`
Client-side utilities for Google authentication:
- `signInWithGoogle`: Direct Firebase authentication with Google
- `linkAccountWithGoogle`: Link existing accounts with Google
- `handleGoogleAuth`: Process Google OAuth tokens

#### `middleware.ts`
API route protection with:
- Authentication verification from Firebase tokens
- Role-based access control
- Admin-only route protection

#### `utils.ts`
Helper utilities for authentication-related tasks, such as token extraction.

### Components

#### `AuthForm.tsx`
Main authentication form component that switches between sign-in and sign-up modes.

#### `SignInForm.tsx`
Form for user sign-in with email/password and Google options.

#### `SignUpForm.tsx`
Form for new user registration with email/password and Google options.

#### UI Components
- `GoogleAuthButton`: Button for Google authentication
- `FormInput`: Reusable input field with validation
- `Checkbox`: Checkbox component for "Remember me" functionality
- `FormDivider`: Visual divider with optional text

### Context

#### `AuthContext.tsx`
Provides global authentication state management that:
- Tracks the current user
- Manages user roles
- Handles authentication state changes
- Provides sign-out functionality for both Firebase and NextAuth

### Hooks

#### `useAuth.ts`
Custom hook for authentication operations:
- Email/password sign-in and sign-up
- Google authentication
- Error handling
- Loading states
- API integration for user creation

## User Roles

The system supports multiple user roles:
- `USER`: Basic user with limited permissions
- `STUDENT`: Student with access to learning materials
- `BETA_TESTER`: User with access to beta features
- `PROFESSOR`: Educational staff with content creation privileges
- `ADMINISTRATOR`: Full system access

## Setup Requirements

1. Environment variables:
   ```
   # Firebase Client Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   
   # Firebase Admin Configuration
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
   - Create a service account for admin SDK

## Usage Examples

### Protecting a Server Component
```tsx
import { authorize } from "@/lib/auth/authorize";
import { Role } from "@/types/roles";

export default async function AdminPage() {
  // Only administrators can access this page
  const session = await authorize([Role.ADMINISTRATOR]);
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.user.name}</p>
    </div>
  );
}
```

### Client-Side Authentication
```tsx
'use client';

import { useAuth } from "@/components/auth";
import { Role } from "@/types/roles";

export default function ProfilePage() {
  const { user, userRole, signOutUser } = useAuth();
  
  if (!user) {
    return <p>Please sign in to view your profile.</p>;
  }
  
  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {user.displayName}</p>
      <p>Email: {user.email}</p>
      <p>Role: {userRole}</p>
      <button onClick={signOutUser}>Sign Out</button>
      
      {userRole === Role.ADMINISTRATOR && (
        <div>
          <h2>Admin Controls</h2>
          {/* Admin-only content */}
        </div>
      )}
    </div>
  );
}
```

### Authentication Forms
```tsx
import { AuthForm } from "@/components/auth";

export default function AuthPage() {
  return (
    <div className="auth-container">
      <AuthForm 
        redirectPath="/dashboard" 
        onSuccess={() => console.log("Authentication successful")} 
      />
    </div>
  );
}
```

## Security Considerations

1. All JWT tokens are stored in HTTP-only cookies via NextAuth
2. Server-side validation of tokens using Firebase Admin SDK
3. Role-based access control for protected routes and API endpoints
4. Custom claims for secure role management
5. Dual authentication system provides enhanced security 