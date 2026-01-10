"use client";

import { Toast } from "@/components/ui";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from "react";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    type: NotificationType,
    title: string,
    message: string
  ) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const MAX_VISIBLE_TOASTS = 3;
const DEDUPE_WINDOW_MS = 1000;

export function NotificationProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const recentNotificationsRef = useRef<Map<string, number>>(new Map());

  const addNotification = useCallback(
    (type: NotificationType, title: string, message: string) => {
      // Create a dedupe key from notification contents
      const dedupeKey = `${type}:${title}:${message}`;
      const now = Date.now();
      
      // Check if this notification was recently added
      const lastAdded = recentNotificationsRef.current.get(dedupeKey);
      if (lastAdded && now - lastAdded < DEDUPE_WINDOW_MS) {
        // Duplicate notification within dedupe window, ignore
        return;
      }
      
      // Update the dedupe tracking
      recentNotificationsRef.current.set(dedupeKey, now);
      
      // Clean up old entries from dedupe map (older than DEDUPE_WINDOW_MS)
      const cutoffTime = now - DEDUPE_WINDOW_MS;
      for (const [key, timestamp] of recentNotificationsRef.current.entries()) {
        if (timestamp < cutoffTime) {
          recentNotificationsRef.current.delete(key);
        }
      }
      
      const id = `${Date.now()}-${Math.random()}`;
      setNotifications((prev) => {
        const updated = [...prev, { id, type, title, message }];
        // Keep only the most recent MAX_VISIBLE_TOASTS notifications
        return updated.slice(-MAX_VISIBLE_TOASTS);
      });
    },
    []
  );

  const removeNotification = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    },
    [setNotifications]
  );

  const value = useMemo(
    () => ({ notifications, addNotification, removeNotification }),
    [notifications, addNotification, removeNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 left-4 sm:left-auto sm:w-full sm:max-w-sm z-50 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex flex-col space-y-4">
          {notifications.map((notification) => (
            <Toast
              key={notification.id}
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}
