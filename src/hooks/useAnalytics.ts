import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AnalyticsData } from "@/components/dashboard/AnalyticsOverview";

export interface UseAnalyticsReturn {
  analyticsData: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    if (!user) {
      // If user is not yet available, don't attempt to fetch.
      // isLoading will remain true until user is available or an error is set.
      // Or, set an error specific to auth if preferred.
      // setError("User not authenticated.");
      // setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch analytics: ${response.status} ${
            errorText || response.statusText
          }`
        );
      }

      const { data }: { data: AnalyticsData } = await response.json();
      setAnalyticsData(data);
    } catch (e) {
      console.error("Error fetching analytics data:", e);
      setError(e instanceof Error ? e.message : "An unknown error occurred");
      setAnalyticsData(null); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Only fetch if user is available
      fetchAnalyticsData();
    } else {
      // If user is null (e.g., on initial load before auth check, or after logout)
      // set isLoading to false if not already handled by fetchAnalyticsData's early return logic.
      // This prevents loading indefinitely if user never becomes available.
      setIsLoading(false);
      setAnalyticsData(null); // Clear data if user logs out
      // setError("User not authenticated. Please log in."); // Optionally set an error
    }
  }, [user, fetchAnalyticsData]);

  return {
    analyticsData,
    isLoading,
    error,
    refreshAnalytics: fetchAnalyticsData,
  };
}
