"use client";

import { signInWithGoogle } from "@/lib/auth/google";
import { auth } from "@/lib/firebase/config";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthMode, FormState } from "../types";

// Process Firebase authentication and handle role setting, user creation, and NextAuth
async function processAuth(idToken: string, callbackUrl: string) {
  try {
    // First, call our API to handle role setting and user creation/update
    const response = await fetch('/api/auth/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idToken,
        callbackUrl
      })
    });
    
    if (!response.ok) {
      console.error('Auth callback failed:', await response.text());
      throw new Error('Authentication process failed');
    }
    
    // Get the response data
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error ?? 'Authentication process failed');
    }
    
    // Force token refresh for updated claims
    await auth.currentUser?.getIdToken(true);
    
    // Proceed with NextAuth
    return await signIn("firebase", {
      redirect: false,
      idToken,
      callbackUrl
    });
  } catch (error) {
    console.error("Auth processing error:", error);
    throw error;
  }
}

export function useAuth(redirectPath = "/dashboard") {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? redirectPath;
  const t = useTranslations("errors.auth");

  useEffect(() => {
    let isMounted = true;

    // Check if returning from a redirect flow
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        // Only process if there's an actual result and component is still mounted
        if (result && isMounted) {
          // User successfully authenticated with redirect
          setIsAuthenticating(true);

          // Get the initial token
          const idToken = await result.user.getIdToken();
          
          // Process the authentication
          const nextAuthResult = await processAuth(idToken, callbackUrl);

          if (nextAuthResult?.error) {
            throw new Error(nextAuthResult.error);
          }

          if (nextAuthResult?.url) {
            router.push(nextAuthResult.url);
          }
        }
      } catch (err) {
        // Only set error if component is mounted and it's not an expected "no redirect" case
        if (
          isMounted &&
          err instanceof FirebaseError &&
          err.code !== "auth/no-auth-event" &&
          err.code !== "auth/credential-already-in-use"
        ) {
          console.error("Redirect authentication error:", err);
          setError(`Authentication error: ${err.code}`);
          setIsAuthenticating(false);
        }
      }
    };

    checkRedirectResult();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [router, callbackUrl]);

  const handleGoogleAuth = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      const googleResult = await signInWithGoogle();

      if (!googleResult.success || !googleResult.user) {
        throw new Error("Google sign-in failed");
      }

      // Get the token
      const idToken = await googleResult.user.getIdToken();
      setIsAuthenticating(true);
      
      // Process the authentication
      const nextAuthResult = await processAuth(idToken, callbackUrl);

      if (nextAuthResult?.error) {
        throw new Error(nextAuthResult.error);
      }

      if (nextAuthResult?.url) {
        router.push(nextAuthResult.url);
      }
    } catch (err) {
      console.error("Google authentication error:", err);
      setError(t("googleFailed"));
      setIsAuthenticating(false);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (mode: AuthMode, formData: FormState) => {
    const { email, password, name } = formData;
    setError("");
    setIsLoading(true);

    try {
      let userCredential;
      
      if (mode === "signin") {
        // Sign in with Firebase email/password first
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        // For sign-up, we still use Firebase directly since we need to create the user first
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Update user profile with name
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });
      }

      // Get the token
      const idToken = await userCredential.user.getIdToken(true);
      setIsAuthenticating(true);
      
      // Process the authentication
      const nextAuthResult = await processAuth(idToken, callbackUrl);

      if (nextAuthResult?.error) {
        throw new Error(nextAuthResult.error);
      }

      if (nextAuthResult?.url) {
        router.push(nextAuthResult.url);
      }
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        if (err.code === "auth/email-already-in-use") {
          setError(t("emailInUse"));
        } else if (err.code === "auth/invalid-email") {
          setError(t("invalidEmail"));
        } else if (
          err.code === "auth/wrong-password" ||
          err.code === "auth/user-not-found"
        ) {
          setError(t("invalidCredentials"));
        } else {
          setError(mode === "signin" ? t("signInFailed") : t("signUpFailed"));
          console.error(err);
        }
      } else {
        setError(t("unexpected"));
        console.error(err);
      }
      setIsAuthenticating(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    setError,
    isLoading,
    isGoogleLoading,
    isAuthenticating,
    handleGoogleAuth,
    handleEmailAuth,
  };
}
