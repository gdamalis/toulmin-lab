"use client";

import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase/config";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthMode, FormState } from "../types";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { signInWithGoogle } from "@/lib/auth/google";

export function useAuth(redirectPath = "/dashboard") {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || redirectPath;
  const t = useTranslations("errors.auth");

  useEffect(() => {
    // Check if returning from a redirect flow
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User successfully authenticated
          setIsAuthenticating(true);
          await createUserViaApi(
            result.user.uid,
            result.user.displayName ?? "",
            result.user.email ?? "",
            result.user.photoURL ?? undefined
          );
          router.push(callbackUrl);
        }
      } catch (err) {
        if (err instanceof FirebaseError) {
          console.error("Redirect authentication error:", err);
          setError(`Authentication error: ${err.code}`);
          setIsAuthenticating(false);
        }
      }
    };

    checkRedirectResult();
  }, [router, callbackUrl]);

  const createUserViaApi = async (
    userId: string,
    name: string,
    email: string,
    picture?: string
  ) => {
    try {
      // Wait for auth state to be fully established
      if (!auth.currentUser) {
        console.warn("Auth user not available yet, waiting...");
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Get a fresh token
      const token = await auth.currentUser?.getIdToken(true);

      if (!token) {
        console.error("Failed to get authentication token");
        return;
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          name,
          email,
          picture,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error creating user:", response.status, errorData);
        throw new Error(`Failed to create user in database: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error("Error creating user via API:", err);
      throw err;
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      const googleResult = await signInWithGoogle();

      if (!googleResult.success || !googleResult.user) {
        throw new Error("Google sign-in failed");
      }

      const idToken = await googleResult.user.getIdToken();
      setIsAuthenticating(true);

      const nextAuthResult = await signIn("firebase", {
        redirect: false,
        idToken,
        callbackUrl,
      });

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
      if (mode === "signin") {
        // Sign in with Firebase email/password first
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        const idToken = await userCredential.user.getIdToken();
        setIsAuthenticating(true);

        const nextAuthResult = await signIn("firebase", {
          redirect: false,
          idToken,
          callbackUrl,
        });

        if (nextAuthResult?.error) {
          throw new Error(nextAuthResult.error);
        }

        if (nextAuthResult?.url) {
          router.push(nextAuthResult.url);
        }
      } else {
        // For sign-up, we still use Firebase directly since we need to create the user first
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Update user profile with name
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });

        // Create or update user via API
        await createUserViaApi(
          userCredential.user.uid, 
          name.trim(), 
          email
        );

        // After signup, create a Next-Auth session using the freshly created ID token
        const idToken = await userCredential.user.getIdToken();
        setIsAuthenticating(true);

        const nextAuthResult = await signIn("firebase", {
          redirect: false,
          idToken,
          callbackUrl,
        });

        if (nextAuthResult?.error) {
          throw new Error(nextAuthResult.error);
        }

        if (nextAuthResult?.url) {
          router.push(nextAuthResult.url);
        }
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
