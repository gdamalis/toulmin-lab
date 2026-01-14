"use client";

import { useNotification } from "@/contexts/NotificationContext";
import { apiClient } from "@/lib/api/client";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface SendEmailData {
  type: 'user_invitation';
  to: string;
  inviterName: string;
  userRole: string;
  temporaryPassword?: string | null;
}

export function useSendEmail() {
  const [isSending, setIsSending] = useState(false);
  const { addNotification } = useNotification();
  const t = useTranslations("admin.users");
  const notifT = useTranslations("notifications");

  const sendEmail = async (emailData: SendEmailData): Promise<boolean> => {
    setIsSending(true);

    try {
      const result = await apiClient.post<{ message: string; emailId?: string }>('/api/email/send', emailData);

      if (result.success) {
        addNotification("success", notifT("titles.success"), t("emailSent"));
        return true;
      }
      
      const errorMessage = result.error ?? notifT("error.emailFailed");
      throw new Error(errorMessage);
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
