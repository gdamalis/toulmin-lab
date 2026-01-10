"use client";

import { useNotification } from "@/contexts/NotificationContext";
import { getCurrentUserToken } from "@/lib/auth/utils";
import { useState } from "react";
import { useSendEmail } from "./useSendEmail";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

interface AddUserData {
  name: string;
  email: string;
  role: string;
  password?: string; // Optional password
}

interface AddUserResponse {
  success: boolean;
  data?: {
    user: {
      userId: string;
      name: string;
      email: string;
      role: string;
    };
    temporaryPassword?: string;
  };
  error?: string;
}

export function useAddUser() {
  const [isAdding, setIsAdding] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const { addNotification } = useNotification();
  const { sendUserInvitation } = useSendEmail();
  const { data: session } = useSession();
  const t = useTranslations("notifications");

  const addUser = async (userData: AddUserData): Promise<{success: boolean; temporaryPassword: string | null}> => {
    setIsAdding(true);
    setTempPassword(null);
    let generatedPassword: string | null = null;

    try {
      // Get the authentication token
      const token = await getCurrentUserToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to add user");
      }

      const result: AddUserResponse = await response.json();

      if (result.success) {
        // If a temporary password was generated, store it for display
        if (result.data?.temporaryPassword) {
          generatedPassword = result.data.temporaryPassword;
          setTempPassword(generatedPassword);
        }
        
        // Send invitation email
        const inviterName = session?.user?.name ?? session?.user?.email ?? "Admin";
        await sendUserInvitation(
          userData.email,
          inviterName,
          userData.role,
          generatedPassword
        );
        
        addNotification("success", t("titles.success"), t("success.userAdded"));
        return { success: true, temporaryPassword: generatedPassword };
      } else {
        throw new Error(result.error ?? t("error.createFailed", { resource: "user" }));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("error.unknownError");
      addNotification("error", t("titles.error"), errorMessage);
      console.error("Failed to add user:", err);
      return { success: false, temporaryPassword: null };
    } finally {
      setIsAdding(false);
    }
  };

  return { addUser, isAdding, tempPassword };
} 