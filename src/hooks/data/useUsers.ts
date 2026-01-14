"use client";

import { useNotification } from "@/contexts/NotificationContext";
import { apiClient } from "@/lib/api/client";
import { User } from "@/types/client";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useApiQuery } from "../api/useApiQuery";

export function useUsers() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { addNotification } = useNotification();
  const t = useTranslations("notifications");

  const { 
    data, 
    isLoading, 
    error, 
    refetch: refreshUsers,
    setData: setUsers 
  } = useApiQuery<{ users: User[] }>('/api/users', {
    onError: (errorMsg) => {
      addNotification("error", t("titles.error"), errorMsg);
    }
  });

  const users = data?.users ?? [];

  const deleteUser = async (userId: string) => {
    setIsDeleting(true);

    try {
      const result = await apiClient.delete(`/api/users/${userId}`);

      if (result.success) {
        // Update local state
        setUsers((prevData) => 
          prevData ? { users: prevData.users.filter((user) => user.userId !== userId) } : prevData
        );
        addNotification("success", t("titles.success"), t("success.userDeleted"));
        return true;
      }
      
      const errorMessage = result.error ?? t("error.deleteFailed", { resource: "user" });
      addNotification("error", t("titles.error"), errorMessage);
      return false;
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

  const updateUser = async (userId: string, userData: Partial<User>) => {
    setIsUpdating(true);

    try {
      const result = await apiClient.patch<{ user: User }>(`/api/users/${userId}`, userData);

      if (result.success && result.data) {
        // Update local state with the returned user data
        setUsers((prevData) =>
          prevData ? {
            users: prevData.users.map((user) =>
              user.userId === userId ? { ...user, ...result.data!.user } : user
            )
          } : prevData
        );

        addNotification("success", t("titles.success"), t("success.userUpdated"));
        return true;
      }
      
      const errorMessage = result.error ?? t("error.updateFailed", { resource: "user" });
      addNotification("error", t("titles.error"), errorMessage);
      return false;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("error.unknownError");
      addNotification("error", t("titles.error"), errorMessage);
      console.error("Failed to update user:", err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    users,
    isLoading,
    error,
    isDeleting,
    isUpdating,
    deleteUser,
    updateUser,
    refreshUsers,
  };
}
