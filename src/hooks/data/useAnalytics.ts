import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AnalyticsData } from "@/components/admin/AnalyticsOverview";
import { apiClient } from "@/lib/api/client";
import { useApiQuery } from "../api/useApiQuery";

export interface UseAnalyticsReturn {
  analyticsData: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const { user } = useAuth();

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useApiQuery<AnalyticsData>('/api/analytics', {
    enabled: !!user,
  });

  const refreshAnalytics = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    analyticsData,
    isLoading,
    error,
    refreshAnalytics,
  };
}
