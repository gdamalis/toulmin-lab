declare namespace NodeJS {
  interface ProcessEnv {
    // Firebase (Public)
    NEXT_PUBLIC_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    NEXT_PUBLIC_FIREBASE_APP_ID: string;
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: string;

    // Firebase (Server)
    FIREBASE_PRIVATE_KEY: string;
    FIREBASE_PROJECT_ID: string;
    FIREBASE_CLIENT_EMAIL: string;

    // Database
    MONGODB_URI: string;

    // Auth
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;

    // External Services
    RESEND_API_KEY: string;
    GEMINI_API_KEY: string;
  }
} 