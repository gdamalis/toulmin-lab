/**
 * Firebase Admin SDK initialization
 * 
 * Single source of truth for Firebase Admin initialization.
 * Import `adminAuth` from this module to use Firebase Admin Auth.
 */

import { getAuth, Auth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';

// Validate required environment variables
const requiredEnvVars = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
};

// Check for missing variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase Admin environment variables: ${missingVars.join(', ')}. ` +
    'Please add them to your .env.local file.'
  );
}

/**
 * Initialize Firebase Admin SDK if not already initialized
 */
let app: App;

if (!getApps().length) {
  app = initializeApp({
    credential: cert({
      projectId: requiredEnvVars.FIREBASE_PROJECT_ID,
      clientEmail: requiredEnvVars.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines with actual newlines in private key
      privateKey: requiredEnvVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
} else {
  app = getApps()[0];
}

/**
 * Firebase Admin Auth instance
 * 
 * Use this for all server-side Firebase Auth operations:
 * - Token verification
 * - User management
 * - Custom claims (roles)
 */
export const adminAuth: Auth = getAuth(app);
