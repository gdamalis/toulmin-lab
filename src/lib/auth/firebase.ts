import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { Role } from "@/types/roles";

// Initialize Firebase Admin SDK if it hasn't been initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Firebase decoded token interface
 */
export interface FirebaseToken {
  uid: string;
  role?: Role;
  [key: string]: unknown;
}

/**
 * Result of Firebase token verification
 */
export interface TokenVerificationResult {
  success: boolean;
  token?: FirebaseToken;
  error?: string;
}

/**
 * Verifies a Firebase authentication token
 */
export async function verifyToken(token: string): Promise<TokenVerificationResult> {
  try {
    const decodedToken = await getAuth().verifyIdToken(token) as FirebaseToken;
    
    if (!decodedToken?.uid) {
      return { success: false, error: "Invalid token claims" };
    }
    
    return { success: true, token: decodedToken };
  } catch (error) {
    console.error("Error verifying token:", error);
    return { success: false, error: "Invalid token" };
  }
}

/**
 * Sets a user's role in Firebase custom claims
 */
export async function setUserRole(uid: string, role: Role): Promise<void> {
  try {
    await getAuth().setCustomUserClaims(uid, { role });
  } catch (error) {
    console.error("Error setting user role:", error);
    throw error;
  }
}

/**
 * Gets a user's role from Firebase
 */
export async function getUserRole(uid: string): Promise<Role | null> {
  try {
    const user = await getAuth().getUser(uid);
    return user.customClaims?.role as Role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
} 