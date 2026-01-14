"use client";

import { useNotification } from "@/contexts/NotificationContext";
import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export type SubscribeStatus = "idle" | "loading" | "success" | "error";

export function useSubscribe() {
  const [status, setStatus] = useState<SubscribeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();
  const t = useTranslations("notifications");

  const subscribe = useCallback(
    async (email: string): Promise<boolean> => {
      setStatus("loading");
      setError(null);

      try {
        const response = await fetch("/api/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || t("error.createFailed", { resource: "subscription" }));
        }

        // Success response handling
        setStatus("success");
        addNotification("success", t("titles.success"), t("success.subscribed"));
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("error.unknownError");
        setError(errorMessage);
        setStatus("error");
        addNotification("error", t("titles.error"), errorMessage);
        console.error("Failed to subscribe:", err);
        return false;
      }
    },
    [addNotification, t]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    status,
    error,
    subscribe,
    reset,
  };
} 