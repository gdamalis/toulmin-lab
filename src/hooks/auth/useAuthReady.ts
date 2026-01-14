"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Hook to track when Firebase auth is ready
 * Extracts the common auth state listener pattern used across multiple hooks
 */
export function useAuthReady() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  return { authReady };
}
