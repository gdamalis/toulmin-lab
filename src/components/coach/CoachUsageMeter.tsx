'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCoach } from '@/contexts/CoachContext';
import { useCoachQuota } from '@/hooks';

interface CoachUsageMeterProps {
  className?: string;
}

/**
 * Small usage meter showing coach chat quota consumption
 * Displays: "X / 200 this month • Resets Jan 1"
 * 
 * Uses context for real-time updates during AI calls,
 * with initial fetch from API on mount
 */
export function CoachUsageMeter({ className = '' }: CoachUsageMeterProps) {
  const t = useTranslations('pages.coach');
  const { quotaState } = useCoach();
  const { quotaStatus, isLoading, refresh } = useCoachQuota();

  // Fetch initial quota status on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Use context state if available (live updates), otherwise fallback to fetched status
  const activeQuotaStatus = quotaState ?? quotaStatus;

  if (isLoading && !activeQuotaStatus) {
    return null;
  }

  if (!activeQuotaStatus) {
    return null;
  }

  // Unlimited users don't see the meter
  if (activeQuotaStatus.isUnlimited) {
    return null;
  }

  const used = activeQuotaStatus.used;
  const limit = activeQuotaStatus.limit ?? 0;
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const resetDate = new Date(activeQuotaStatus.resetAt);
  
  // Format reset date
  const resetDateFormatted = resetDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  // Color coding based on usage
  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-primary-600';
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-3 shadow-sm ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
        <span className="font-medium">
          {t('quota.usage')}: {used} / {limit}
        </span>
        <span className="text-gray-500">
          {t('quota.resets')} {resetDateFormatted}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {percentage >= 100 && (
        <p className="mt-2 text-xs text-red-600">
          {t('quota.exhausted')}
        </p>
      )}
    </div>
  );
}

