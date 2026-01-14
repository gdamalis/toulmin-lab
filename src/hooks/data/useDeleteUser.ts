"use client";

import { useNotification } from "@/contexts/NotificationContext";
import { apiClient } from "@/lib/api/client";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function useDeleteUser() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { addNotification } = useNotification();
  const t = useTranslations("notifications");

  const deleteUser = async (userId: string): Promise<boolean> => {
    setIsDeleting(true);

    try {
      const result = await apiClient.delete(`/api/users/${userId}`);

      if (result.success) {
        addNotification("success", t("titles.success"), t("success.userDeleted"));
        return true;
      }
      
      const errorMessage = result.error ?? t("error.deleteFailed", { resource: "user" });
      throw new Error(errorMessage);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("error.unknownError");
      addNotification("error", t("titles.error"), errorMessage);
      console.error("Failed to delete user:", err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteUser, isDeleting };
}
