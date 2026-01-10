'use client';

import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { ProposedUpdate } from '@/types/coach';
import { useTranslations } from 'next-intl';

interface ProposedUpdateCardProps {
  proposal: ProposedUpdate;
  onConfirm: () => void;
  onReject: () => void;
  isLoading?: boolean;
  isAccepted?: boolean;
}

export function ProposedUpdateCard({
  proposal,
  onConfirm,
  onReject,
  isLoading = false,
  isAccepted = false,
}: ProposedUpdateCardProps) {
  const t = useTranslations('pages.coach');
  const stepName = t(`steps.${proposal.field}`);

  return (
    <div className={`rounded-lg border p-4 ${
      isAccepted 
        ? 'border-green-200 bg-green-50' 
        : 'border-blue-200 bg-blue-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className={`text-sm font-medium ${
            isAccepted ? 'text-green-900' : 'text-blue-900'
          }`}>
            {t('suggestedText', { step: stepName })}
          </h4>
          <p className={`mt-1 text-sm italic ${
            isAccepted ? 'text-green-800' : 'text-blue-800'
          }`}>
            &ldquo;{proposal.value}&rdquo;
          </p>
          <p className={`mt-2 text-xs ${
            isAccepted ? 'text-green-600' : 'text-blue-600'
          }`}>
            {proposal.rationale}
          </p>
        </div>
        {isAccepted && (
          <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <CheckIcon className="mr-1 h-3 w-3" />
            {t('usedBadge')}
          </span>
        )}
      </div>
      
      {!isAccepted && (
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            onClick={onConfirm}
            variant="primary"
            size="sm"
            disabled={isLoading}
          >
            <CheckIcon className="mr-1 h-4 w-4" />
            {t('useThis')}
          </Button>
          <Button
            type="button"
            onClick={onReject}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <XMarkIcon className="mr-1 h-4 w-4" />
            {t('rewriteButton')}
          </Button>
        </div>
      )}
    </div>
  );
}
