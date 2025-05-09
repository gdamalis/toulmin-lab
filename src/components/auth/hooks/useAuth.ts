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
    email: string
  ) => {
    try {
      const token = await auth.currentUser?.getIdToken();

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
        }),
      });

      if (!response.ok) {
        console.error("Failed to create user in database");
      }
    } catch (err) {
      console.error("Error creating user in database:", err);
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
        // Create user in database after Google auth
        await createUserInDatabase(
          result.user.uid,
          result.user.displayName ?? "",
          result.user.email ?? ""
        );
        router.push(redirectPath);
      }
    } catch (err) {
      setIsGoogleLoading(false);
      if (err instanceof FirebaseError) {
        setError(`Authentication failed: ${err.code}`);
      } else {
        setError(t("googleFailed"));
      }
      console.error(err);
    }
  };

  const handleEmailAuth = async (mode: AuthMode, formData: FormState) => {
    const { email, password, name } = formData;
    setError("");
    setIsLoading(true);

    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
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

        // Create user in database immediately after signup
        await createUserInDatabase(userCredential.user.uid, name.trim(), email);

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
