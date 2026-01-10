"use client";

import { useNotification } from "@/contexts/NotificationContext";
import { getCurrentUserToken } from "@/lib/auth/utils";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface DeleteUserResponse {
  success: boolean;
  error?: string;
}

export function useDeleteUser() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { addNotification } = useNotification();
  const t = useTranslations("notifications");

  const deleteUser = async (userId: string): Promise<boolean> => {
    setIsDeleting(true);

    try {
      // Get the authentication token
      const token = await getCurrentUserToken();

      if (!token) {
        throw new Error(t("error.authRequired"));
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? t("error.deleteFailed", { resource: "user" }));
      }

      const result: DeleteUserResponse = await response.json();

      if (result.success) {
        addNotification("success", t("titles.success"), t("success.userDeleted"));
        return true;
      } else {
        throw new Error(result.error ?? t("error.deleteFailed", { resource: "user" }));
      }
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