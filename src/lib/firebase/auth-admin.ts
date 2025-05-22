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

// Verify Firebase ID token
export async function getToken(token: string) {
  try {
    return await getAuth().verifyIdToken(token);
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export async function setUserRole(uid: string, role: Role): Promise<void> {
  try {
    await getAuth().setCustomUserClaims(uid, { role });
  } catch (error) {
    console.error("Error setting user role:", error);
    throw error;
  }
}

export async function getUserRole(uid: string): Promise<Role | null> {
  try {
    const user = await getAuth().getUser(uid);
    return user.customClaims?.role as Role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * Creates a new user in Firebase Authentication
 * @param email User's email address
 * @param password User's password (will be automatically generated if not provided)
 * @param displayName User's display name
 * @returns The created user record with uid
 */
export async function createFirebaseUser(email: string, password?: string, displayName?: string) {
  try {
    // If no password is provided, generate a random one (user will need to reset password)
    const userPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
    
    const userRecord = await getAuth().createUser({
      email,
      emailVerified: false,
      password: userPassword,
      displayName,
      disabled: false,
    });
    
    return {
      success: true,
      user: userRecord,
      temporaryPassword: password ? undefined : userPassword
    };
  } catch (error) {
    console.error("Error creating new Firebase user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating user'
    };
  }
}

/**
 * Deletes a user from Firebase Authentication
 * @param uid User's Firebase UID
 * @returns Success status and error message if applicable
 */
export async function deleteFirebaseUser(uid: string) {
  try {
    await getAuth().deleteUser(uid);
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error deleting Firebase user:", error);
    
    // Handle "user-not-found" specially - we consider it a success 
    // if we're trying to delete a user that doesn't exist in Firebase
    if (error instanceof Error && error.message.includes("user-not-found")) {
      return {
        success: true,
        warning: "User not found in Firebase, but operation marked as successful"
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error deleting user'
    };
  }
} 