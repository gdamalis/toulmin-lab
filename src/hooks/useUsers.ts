"use client";

import { useNotification } from "@/contexts/NotificationContext";
import { getCurrentUserToken } from "@/lib/auth/utils";
import { auth } from "@/lib/firebase/config";
import { User } from "@/types/client";
import { onAuthStateChanged } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const { addNotification } = useNotification();

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the authentication token
      const token = await getCurrentUserToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to fetch users");
      }

      const data = await response.json();

      // Make sure we have the expected data format
      if (data.success && data.data && Array.isArray(data.data.users)) {
        setUsers(data.data.users);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      addNotification("error", "Error", errorMessage);
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    // Only fetch users when auth is ready
    if (authReady) {
      fetchUsers();
    }
  }, [fetchUsers, authReady]);

  const deleteUser = async (userId: string) => {
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

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.userId !== userId)
      );
      addNotification("success", "Success", "User deleted successfully");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      addNotification("error", "Error", errorMessage);
      console.error("Failed to delete user:", err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    setIsUpdating(true);

    try {
      // Get the authentication token
      const token = await getCurrentUserToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to update user");
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Update local state with the returned user data
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === userId ? { ...user, ...result.data.user } : user
          )
        );

        addNotification("success", "Success", "User updated successfully");
        return true;
      } else {
        throw new Error(result.error ?? "Failed to update user");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      addNotification("error", "Error", errorMessage);
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
    refreshUsers: fetchUsers,
  };
}
