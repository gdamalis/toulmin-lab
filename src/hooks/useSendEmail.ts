"use client";

import { useNotification } from "@/contexts/NotificationContext";
import { getCurrentUserToken } from "@/lib/auth/utils";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface SendEmailData {
  type: 'user_invitation';
  to: string;
  inviterName: string;
  userRole: string;
  temporaryPassword?: string | null;
}

interface SendEmailResponse {
  success: boolean;
  data?: {
    message: string;
    emailId?: string;
  };
  error?: string;
}

export function useSendEmail() {
  const [isSending, setIsSending] = useState(false);
  const { addNotification } = useNotification();
  const t = useTranslations("admin.users");
  const notifT = useTranslations("notifications");

  const sendEmail = async (emailData: SendEmailData): Promise<boolean> => {
    setIsSending(true);

    try {
      // Get the authentication token
      const token = await getCurrentUserToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to send email");
      }

      const result: SendEmailResponse = await response.json();

      if (result.success) {
        addNotification("success", notifT("titles.success"), t("emailSent"));
        return true;
      } else {
        throw new Error(result.error ?? notifT("error.emailFailed"));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : notifT("error.unknownError");
      addNotification("error", notifT("titles.error"), errorMessage);
      console.error("Failed to send email:", err);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const sendUserInvitation = async (
    to: string,
    inviterName: string,
    userRole: string,
    temporaryPassword?: string | null
  ): Promise<boolean> => {
    return sendEmail({
      type: 'user_invitation',
      to,
      inviterName,
      userRole,
      temporaryPassword,
    });
  };

  return { 
    sendEmail, 
    sendUserInvitation, 
    isSending 
  };
} 