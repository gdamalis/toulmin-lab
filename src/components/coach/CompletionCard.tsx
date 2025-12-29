'use client';

import Link from 'next/link';
import { CheckCircleIcon, ExclamationTriangleIcon, ArrowRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface CompletionCardProps {
  argumentId?: string;
  error?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function CompletionCard({
  argumentId,
  error,
  onRetry,
  isRetrying = false,
}: CompletionCardProps) {
  const t = useTranslations('pages.coach');

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-semibold text-red-900">
          {t('error.saveFailed')}
        </h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="danger"
            className="mt-4"
            disabled={isRetrying}
            isLoading={isRetrying}
          >
            <ArrowPathIcon className="mr-2 h-4 w-4" />
            {t('error.tryAgain')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
      <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
      <h3 className="mt-4 text-lg font-semibold text-green-900">
        {t('completion.title')}
      </h3>
      <p className="mt-2 text-sm text-green-700">
        {t('completion.message')}
      </p>
      
      {argumentId && (
        <Link href={`/argument/view/${argumentId}`}>
          <Button variant="primary" className="mt-4">
            {t('completion.viewArgument')}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}
