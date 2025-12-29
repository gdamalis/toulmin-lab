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
}

export function ProposedUpdateCard({
  proposal,
  onConfirm,
  onReject,
  isLoading = false,
}: ProposedUpdateCardProps) {
  const t = useTranslations('pages.coach');
  const stepName = t(`steps.${proposal.field}`);

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-medium text-blue-900">
            {t('suggestedText', { step: stepName })}
          </h4>
          <p className="mt-1 text-sm text-blue-800 italic">
            &ldquo;{proposal.value}&rdquo;
          </p>
          <p className="mt-2 text-xs text-blue-600">
            {proposal.rationale}
          </p>
        </div>
      </div>
      
      <div className="mt-3 flex gap-2">
        <Button
          onClick={onConfirm}
          variant="primary"
          size="sm"
          disabled={isLoading}
        >
          <CheckIcon className="mr-1 h-4 w-4" />
          {t('useThis')}
        </Button>
        <Button
          onClick={onReject}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <XMarkIcon className="mr-1 h-4 w-4" />
          {t('rewrite')}
        </Button>
      </div>
    </div>
  );
}
