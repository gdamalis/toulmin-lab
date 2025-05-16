import { auth } from "@/lib/firebase/config";
import { 
  GoogleAuthProvider, 
  signInWithCredential, 
  signInWithPopup
} from "firebase/auth";

/**
 * Signs in with Google using Firebase and returns user credentials
 * This is used client-side for Google sign-in initiation
 */
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    const result = await signInWithPopup(auth, provider);
    
    // This gives you a Google Access Token you can use to access the Google API
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    
    // The signed-in user info
    const user = result.user;
    
    return { 
      success: true, 
      user, 
      token 
    };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return { 
      success: false, 
      error 
    };
  }
}

/**
 * Links existing Firebase account with Google
 * Used for account linking when user already has an account
 */
export async function linkAccountWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    
    // Get the currently signed in user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }
    
    // Link the Google provider to the existing account
    const result = await signInWithPopup(auth, provider);
    
    return { 
      success: true, 
      user: result.user 
    };
  } catch (error) {
    console.error("Error linking account with Google:", error);
    return { 
      success: false, 
      error 
    };
  }
}

/**
 * Handles Google OAuth token conversion to Firebase token
 * Used by Next Auth when receiving tokens from Google provider
 */
export async function handleGoogleAuth(idToken: string) {
  try {
    // Create credential from the Google ID token
    const credential = GoogleAuthProvider.credential(idToken);
    
    // Sign in to Firebase with the Google credential
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;
    
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error("Error handling Google authentication:", error);
    return {
      success: false,
      error
    };
  }
} 