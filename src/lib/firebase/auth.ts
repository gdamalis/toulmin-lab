import { getAuth } from "firebase/auth";
import { firebaseApp } from "./config";

const auth = getAuth(firebaseApp);

/**
 * Get the current user's ID token
 * Re-exported from @/lib/auth/utils for convenience
 */
export { getCurrentUserToken as getToken } from "@/lib/auth/utils";

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