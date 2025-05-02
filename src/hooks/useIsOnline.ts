import { useEffect, useState } from 'react';

/**
 * Hook to track online/offline status of the application
 * @returns boolean indicating whether the app is currently online
 */
export function useIsOnline(): boolean {
  // Default to true for SSR
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Update with current online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Set initial status from navigator
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    // Add event listeners for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return isOnline;
} 