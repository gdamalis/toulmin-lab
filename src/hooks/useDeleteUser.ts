"use client";

import { useNotification } from "@/contexts/NotificationContext";
import { getCurrentUserToken } from "@/lib/auth/utils";
import { useState } from "react";

interface DeleteUserResponse {
  success: boolean;
  error?: string;
}

export function useDeleteUser() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { addNotification } = useNotification();

  const deleteUser = async (userId: string): Promise<boolean> => {
    setIsDeleting(true);

    try {
      // Get the authentication token
      const token = await getCurrentUserToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to delete user");
      }

      const result: DeleteUserResponse = await response.json();

      if (result.success) {
        addNotification("success", "Success", "User deleted successfully");
        return true;
      } else {
        throw new Error(result.error ?? "Failed to delete user");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      addNotification("error", "Error", errorMessage);
      console.error("Failed to delete user:", err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteUser, isDeleting };
} 