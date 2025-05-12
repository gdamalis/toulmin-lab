"use client";

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { AuthMode, FormState } from "../types";
import { useTranslations } from "next-intl";

export function useAuth(redirectPath = "/dashboard") {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("errors.auth");

  useEffect(() => {
    // Check if returning from a redirect flow
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User successfully authenticated
          await createUserInDatabase(
            result.user.uid,
            result.user.displayName ?? "",
            result.user.email ?? "",
            result.user.photoURL ?? undefined
          );
          router.push(redirectPath);
        }
      } catch (err) {
        if (err instanceof FirebaseError) {
          console.error("Redirect authentication error:", err);
          setError(`Authentication error: ${err.code}`);
        }
      }
    };

    checkRedirectResult();
  }, [router, redirectPath]);

  const createUserInDatabase = async (
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

      const response = await fetch("/api/user", {
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
      
      // Force token refresh to get the newly set claims
      await auth.currentUser?.getIdToken(true);
      
      return await response.json();
    } catch (err) {
      console.error("Error creating user in database:", err);
      throw err;
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      // Use signInWithPopup for all environments
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        // Create or update user in database after Google auth to ensure role claims are set
        await createUserInDatabase(
          result.user.uid,
          result.user.displayName ?? "",
          result.user.email ?? "",
          result.user.photoURL ?? undefined
        );
        // Add a small delay to ensure Firebase has time to process the token refresh
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push(redirectPath);
      }
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(`Authentication failed: ${err.code}`);
      } else {
        setError(t("googleFailed"));
      }
      console.error(err);
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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Always create/update the user in the database after sign-in
        // This ensures roles are properly set in Firebase custom claims
        if (userCredential.user) {
          await createUserInDatabase(
            userCredential.user.uid,
            userCredential.user.displayName ?? name ?? email.split("@")[0],
            userCredential.user.email ?? email,
            userCredential.user.photoURL ?? undefined
          );
        }
        
        // Add a small delay to ensure Firebase has time to process the token refresh
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push(redirectPath);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Update user profile with name
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });

        // Create or update user in database immediately after signup
        await createUserInDatabase(
          userCredential.user.uid, 
          name.trim(), 
          email
        );

        // Add a small delay to ensure Firebase has time to process the token refresh
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push(redirectPath);
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
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    setError,
    isLoading,
    isGoogleLoading,
    handleGoogleAuth,
    handleEmailAuth,
  };
}
