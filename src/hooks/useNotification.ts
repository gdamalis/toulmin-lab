"use client";

import { useNotification as useNotificationContext } from "@/contexts/NotificationContext";
import type { NotificationType } from "@/contexts/NotificationContext";

interface UseNotificationReturn {
  showNotification: (type: NotificationType, title: string, message: string) => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  removeNotification: (id: string) => void;
}

export default function useNotification(): UseNotificationReturn {
  const { addNotification, removeNotification } = useNotificationContext();

  const showNotification = (type: NotificationType, title: string, message: string) => {
    addNotification(type, title, message);
  };

  const showSuccess = (title: string, message: string) => {
    addNotification("success", title, message);
  };

  const showError = (title: string, message: string) => {
    addNotification("error", title, message);
  };

  const showInfo = (title: string, message: string) => {
    addNotification("info", title, message);
  };

  const showWarning = (title: string, message: string) => {
    addNotification("warning", title, message);
  };

  return {
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeNotification,
  };
} 