import { useState, useCallback } from "react";

/**
 * Custom hook for debouncing function calls
 * @param callback The function to debounce
 * @param delay Delay in milliseconds
 */
export function useDebounce<T>(
  callback: (data: T) => void,
  delay: number
) {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedFn = useCallback(
    (data: T) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      const id = setTimeout(() => {
        callback(data);
      }, delay);
      
      setTimeoutId(id);
    },
    [callback, delay, timeoutId]
  );

  return debouncedFn;
} 