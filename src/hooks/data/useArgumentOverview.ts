"use client";

import { useState, useCallback } from "react";
import { ToulminArgument } from "@/types/client";
import { DraftOverview } from "@/lib/services/coach";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import { useTranslations } from "next-intl";
import { useApiQuery } from "../api/useApiQuery";

interface ArgumentOverviewData {
  arguments: ToulminArgument[];
  drafts: DraftOverview[];
}

export function useArgumentOverview() {
  const [isDeletingArgument, setIsDeletingArgument] = useState(false);
  const [isDeletingDraft, setIsDeletingDraft] = useState(false);
  const { addNotification } = useNotification();
  const { user, isLoading: isAuthLoading } = useAuth();
  const t = useTranslations("notifications");

  const {
    data,
    isLoading,
    error,
    refetch: refreshOverview,
    setData,
  } = useApiQuery<ArgumentOverviewData>('/api/argument/overview', {
    enabled: !isAuthLoading && !!user,
    onError: (errorMsg) => {
      addNotification("error", t("titles.error"), errorMsg);
    }
  });

  const toulminArguments = data?.arguments ?? [];
  const drafts = data?.drafts ?? [];

  const deleteArgument = useCallback(async (argumentId: string): Promise<boolean> => {
    setIsDeletingArgument(true);

    try {
      const result = await apiClient.delete(`/api/argument/${argumentId}`);

      if (result.success) {
        // Update local state
        setData((prev) =>
          prev ? {
            ...prev,
            arguments: prev.arguments.filter((arg) => arg._id?.toString() !== argumentId)
          } : prev
        );
        addNotification("success", t("titles.success"), t("success.argumentDeleted"));
        return true;
      }
      
      const errorMessage = result.error ?? t("error.deleteFailed", { resource: "argument" });
      throw new Error(errorMessage);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("error.unknownError");
      addNotification("error", t("titles.error"), errorMessage);
      console.error("Failed to delete argument:", err);
      return false;
    } finally {
      setIsDeletingArgument(false);
    }
  }, [addNotification, t, setData]);

  const deleteDraft = useCallback(async (sessionId: string): Promise<boolean> => {
    setIsDeletingDraft(true);

    try {
      const result = await apiClient.delete(`/api/coach/session/${sessionId}`);

      if (result.success) {
        // Update local state
        setData((prev) =>
          prev ? {
            ...prev,
            drafts: prev.drafts.filter((d) => d.sessionId !== sessionId)
          } : prev
        );
        addNotification("success", t("titles.success"), t("success.draftDeleted"));
        return true;
      }
      
      const errorMessage = result.error ?? t("error.deleteFailed", { resource: "draft" });
      throw new Error(errorMessage);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("error.unknownError");
      addNotification("error", t("titles.error"), errorMessage);
      console.error("Failed to delete draft:", err);
      return false;
    } finally {
      setIsDeletingDraft(false);
    }
  }, [addNotification, t, setData]);

  return {
    toulminArguments,
    drafts,
    isLoading,
    error,
    isDeletingArgument,
    isDeletingDraft,
    deleteArgument,
    deleteDraft,
    refreshOverview,
  };
}
