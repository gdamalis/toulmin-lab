'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentUserToken } from '@/lib/auth/utils';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<CoachQuotaStatus | null>(null);

  const fetchQuota = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await getCurrentUserToken();
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/coach/quota', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quota status');
      }

      const { data } = await response.json();
      setQuotaStatus(data);
    } catch (err) {
      console.error('Error fetching coach quota:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const canUseAI = quotaStatus?.isUnlimited || (quotaStatus?.remaining ?? 0) > 0;

  return {
    isLoading,
    error,
    canUseAI,
    quotaStatus,
    refresh: fetchQuota,
  };
}

