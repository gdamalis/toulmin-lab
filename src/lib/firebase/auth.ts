import { getAuth } from "firebase/auth";
import { firebaseApp } from "./config";

const auth = getAuth(firebaseApp);

/**
 * Get the current user's ID token
 */
export async function getToken(): Promise<string | null> {
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Check if a user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!auth.currentUser;
} 