import { auth } from "@/lib/firebase/config";

/**
 * Extracts token from Authorization header
 */
export function extractAuthToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  
  return authHeader.split("Bearer ")[1];
}

/**
 * Get the current user's authentication token
 * @param retryCount Number of retries if auth.currentUser is not immediately available
 * @returns Promise that resolves to the token string or null if no user is signed in
 */
export async function getCurrentUserToken(retryCount = 3): Promise<string | null> {
  try {
    // If we already have the currentUser, get the token immediately
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken(true);
    }
    
    // If we still have retries left, wait a bit and try again
    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return getCurrentUserToken(retryCount - 1);
    }
    
    // No more retries, return null
    return null;
  } catch (error) {
    console.error("Error getting user token:", error);
    return null;
  }
} 