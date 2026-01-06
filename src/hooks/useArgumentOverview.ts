"use client";

import { useState, useEffect, useCallback } from "react";
import { ToulminArgument } from "@/types/client";
import { DraftOverview } from "@/lib/services/coach";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUserToken } from "@/lib/auth/utils";

interface ArgumentOverviewData {
  arguments: ToulminArgument[];
  drafts: DraftOverview[];
}

export function useArgumentOverview() {
  const [toulminArguments, setToulminArguments] = useState<ToulminArgument[]>([]);
  const [drafts, setDrafts] = useState<DraftOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingArgument, setIsDeletingArgument] = useState(false);
  const [isDeletingDraft, setIsDeletingDraft] = useState(false);
  const { addNotification } = useNotification();
  const { user, isLoading: isAuthLoading } = useAuth();

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getCurrentUserToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/argument/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to fetch data");
      }

      const { data } = await response.json() as { data: ArgumentOverviewData };
      setToulminArguments(data.arguments ?? []);
      setDrafts(data.drafts ?? []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      addNotification("error", "Error", errorMessage);
      console.error("Failed to load overview:", err);
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  // Fetch when auth is ready and user is logged in
  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchOverview();
    } else if (!isAuthLoading && !user) {
      setIsLoading(false);
      setError("Authentication required");
    }
  }, [fetchOverview, isAuthLoading, user]);

  const deleteArgument = useCallback(async (argumentId: string): Promise<boolean> => {
    setIsDeletingArgument(true);

    try {
      const token = await getCurrentUserToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/argument/${argumentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to delete argument");
      }

      // Update local state
      setToulminArguments((prev) =>
        prev.filter((arg) => arg._id?.toString() !== argumentId)
      );
      addNotification("success", "Success", "Argument deleted successfully");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      addNotification("error", "Error", errorMessage);
      console.error("Failed to delete argument:", err);
      return false;
    } finally {
      setIsDeletingArgument(false);
    }
  }, [addNotification]);

  const deleteDraft = useCallback(async (sessionId: string): Promise<boolean> => {
    setIsDeletingDraft(true);

    try {
      const token = await getCurrentUserToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/coach/session/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to delete draft");
      }

      // Update local state
      setDrafts((prev) =>
        prev.filter((d) => d.sessionId !== sessionId)
      );
      addNotification("success", "Success", "Draft deleted successfully");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      addNotification("error", "Error", errorMessage);
      console.error("Failed to delete draft:", err);
      return false;
    } finally {
      setIsDeletingDraft(false);
    }
  }, [addNotification]);

  return {
    toulminArguments,
    drafts,
    isLoading,
    error,
    isDeletingArgument,
    isDeletingDraft,
    deleteArgument,
    deleteDraft,
    refreshOverview: fetchOverview,
  };
}
