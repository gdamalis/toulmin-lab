import { useSyncExternalStore } from 'react';

/**
 * Subscribe to online/offline events
 */
function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

/**
 * Get current online status (client)
 */
function getSnapshot(): boolean {
  return navigator.onLine;
}

/**
 * Get online status for SSR (always true)
 */
function getServerSnapshot(): boolean {
  return true;
}

/**
 * Hook to track online/offline status of the application
 * @returns boolean indicating whether the app is currently online
 */
export function useIsOnline(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
} 