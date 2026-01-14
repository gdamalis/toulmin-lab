import { randomBytes } from 'crypto';
import { Role } from "@/types/roles";
import { logger } from '@/lib/logger';
import { adminAuth } from './admin';

// Verify Firebase ID token
export async function getToken(token: string) {
  try {
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    logger.error("Error verifying token", error);
    return null;
  }
}

export async function setUserRole(uid: string, role: Role): Promise<void> {
  try {
    await adminAuth.setCustomUserClaims(uid, { role });
  } catch (error) {
    logger.error("Error setting user role", error, { userId: uid });
    throw error;
  }
}

export async function getUserRole(uid: string): Promise<Role | null> {
  try {
    const user = await adminAuth.getUser(uid);
    return user.customClaims?.role as Role || null;
  } catch (error) {
    logger.error("Error getting user role", error, { userId: uid });
    return null;
  }
}

/**
 * Generates a cryptographically secure random password
 * @param length Length of the password (default: 16)
 * @returns A secure random password
 */
function generateSecurePassword(length: number = 16): string {
  // Generate random bytes and convert to base64url format (safe for URLs and passwords)
  return randomBytes(length).toString('base64url').slice(0, length);
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
    // If no password is provided, generate a cryptographically secure random one
    const userPassword = password ?? generateSecurePassword(16);
    
    const userRecord = await adminAuth.createUser({
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
    logger.error("Error creating new Firebase user", error);
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
    await adminAuth.deleteUser(uid);
    
    return {
      success: true
    };
  } catch (error) {
    // Handle "user-not-found" specially - we consider it a success 
    // if we're trying to delete a user that doesn't exist in Firebase
    if (error instanceof Error && error.message.includes("user-not-found")) {
      logger.warn("User not found in Firebase during deletion", { userId: uid });
      return {
        success: true,
        warning: "User not found in Firebase, but operation marked as successful"
      };
    }
    
    logger.error("Error deleting Firebase user", error, { userId: uid });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error deleting user'
    };
  }
} 