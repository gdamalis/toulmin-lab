'use client';

import { useApiQuery } from '../api/useApiQuery';

export interface CoachQuotaStatus {
  used: number;
  limit: number | null;
  remaining: number | null;
  resetAt: string;
  isUnlimited: boolean;
}

export interface UseCoachQuotaReturn {
  isLoading: boolean;
  error: string | null;
  canUseAI: boolean;
  quotaStatus: CoachQuotaStatus | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage coach quota status
 * Used for UI gating (disabling AI buttons) and displaying usage
 */
export function useCoachQuota(): UseCoachQuotaReturn {
  const { data: quotaStatus, isLoading, error, refetch } = useApiQuery<CoachQuotaStatus>('/api/coach/quota');

  const canUseAI = quotaStatus?.isUnlimited || (quotaStatus?.remaining ?? 0) > 0;

  return {
    isLoading,
    error,
    canUseAI,
    quotaStatus,
    refresh: refetch,
  };
}
