"use client";

import { useNotification } from "@/contexts/NotificationContext";
import { apiClient } from "@/lib/api/client";
import { useState } from "react";
import { useSendEmail } from "./useSendEmail";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

interface AddUserData {
  name: string;
  email: string;
  role: string;
  password?: string;
}

interface AddUserResponse {
  user: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
  temporaryPassword?: string;
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
      const result = await apiClient.post<AddUserResponse>('/api/users/create', userData);

      if (result.success && result.data) {
        // If a temporary password was generated, store it for display
        if (result.data.temporaryPassword) {
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
      }
      
      const errorMessage = result.error ?? t("error.createFailed", { resource: "user" });
      throw new Error(errorMessage);
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
