import { useCallback } from "react";

/**
 * Custom hook for form persistence with localStorage
 * @param key The storage key to use
 * @param initialValue The initial value if nothing is in storage
 */
export function useFormPersistence<T>(key: string, initialValue: T) {
  // Load data from localStorage if available
  const loadSavedData = useCallback(() => {
    if (typeof window === "undefined") return initialValue;
    
    try {
      const savedItem = localStorage.getItem(key);
      if (savedItem) {
        return JSON.parse(savedItem) as T;
      }
    } catch (error) {
      console.error("Failed to load saved form data:", error);
    }
    return initialValue;
  }, [key, initialValue]);

  // Save data to localStorage
  const saveData = useCallback((data: T) => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save form data:", error);
    }
  }, [key]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to clear saved form data:", error);
    }
  }, [key]);

  return { loadSavedData, saveData, clearSavedData };
} 