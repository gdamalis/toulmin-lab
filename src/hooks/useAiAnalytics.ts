import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Daily time series data point from API
 */
export interface DailyDataPoint {
  date: string;
  requests: number;
  uniqueUsers: number;
  successCount: number;
  errorCount: number;
  quotaDeniedCount: number;
  rateLimitedCount: number;
}

/**
 * Model breakdown item from API
 */
export interface ModelBreakdownItem {
  providerModel: string;
  provider: string;
  model: string;
  requests: number;
  uniqueUsers: number;
  successRate: number;
}

/**
 * Feature breakdown item from API
 */
export interface FeatureBreakdownItem {
  feature: string;
  requests: number;
  uniqueUsers: number;
  successRate: number;
}

/**
 * User usage item from API
 */
export interface UserUsageItem {
  uid: string;
  requests: number;
  successCount: number;
  errorCount: number;
  lastRequestAt: string;
}

/**
 * AI analytics totals
 */
export interface AiAnalyticsTotals {
  totalRequests: number;
  totalSuccess: number;
  totalErrors: number;
  totalQuotaDenied: number;
  totalRateLimited: number;
  totalUniqueUsers: number;
}

/**
 * Complete AI analytics data
 */
export interface AiAnalyticsData {
  series: DailyDataPoint[];
  totals: AiAnalyticsTotals;
  models: ModelBreakdownItem[];
  features: FeatureBreakdownItem[];
  topUsers: UserUsageItem[];
}

/**
 * Filter parameters for AI analytics
 */
export interface AiAnalyticsFilters {
  from?: string;
  to?: string;
  feature?: string;
  model?: string;
}

/**
 * Hook return type
 */
export interface UseAiAnalyticsReturn {
  data: AiAnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  filters: AiAnalyticsFilters;
  setFilters: (filters: AiAnalyticsFilters) => void;
  refresh: () => Promise<void>;
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: AiAnalyticsFilters): string {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.feature) params.set("feature", filters.feature);
  if (filters.model) params.set("model", filters.model);
  return params.toString();
}

/**
 * Hook for fetching AI analytics data
 */
export function useAiAnalytics(
  initialFilters: AiAnalyticsFilters = {}
): UseAiAnalyticsReturn {
  const { user } = useAuth();
  const [data, setData] = useState<AiAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AiAnalyticsFilters>(initialFilters);

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const queryString = buildQueryString(filters);
      const headers = { Authorization: `Bearer ${token}` };

      // Build query parameters
      const baseQuery = queryString ? `?${queryString}` : "";
      const usersQuery = queryString ? `?${queryString}&limit=10` : "?limit=10";

      // Fetch all endpoints in parallel
      const [overviewRes, modelsRes, featuresRes, usersRes] = await Promise.all([
        fetch(`/api/analytics/ai${baseQuery}`, { headers }),
        fetch(`/api/analytics/ai/models${baseQuery}`, { headers }),
        fetch(`/api/analytics/ai/features${baseQuery}`, { headers }),
        fetch(`/api/analytics/ai/users${usersQuery}`, { headers }),
      ]);

      // Check all responses
      if (!overviewRes.ok || !modelsRes.ok || !featuresRes.ok || !usersRes.ok) {
        throw new Error("Failed to fetch AI analytics data");
      }

      const [overviewData, modelsData, featuresData, usersData] =
        await Promise.all([
          overviewRes.json(),
          modelsRes.json(),
          featuresRes.json(),
          usersRes.json(),
        ]);

      setData({
        series: overviewData.data.series,
        totals: overviewData.data.totals,
        models: modelsData.data.breakdown,
        features: featuresData.data.breakdown,
        topUsers: usersData.data.users,
      });
    } catch (err) {
      console.error("Error fetching AI analytics:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setIsLoading(false);
      setData(null);
    }
  }, [user, fetchData]);

  return {
    data,
    isLoading,
    error,
    filters,
    setFilters,
    refresh: fetchData,
  };
}
