'use client';

import { memo } from 'react';
import { CheckCircleIcon, EllipsisHorizontalCircleIcon } from '@heroicons/react/24/solid';
import { TOULMIN_STEP_ORDER, ToulminStep } from '@/types/coach';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface StepIndicatorProps {
  currentStep: ToulminStep;
  completedSteps: Record<ToulminStep, boolean>;
  onStepClick?: (step: ToulminStep) => void;
}

function StepIndicatorComponent({ 
  currentStep, 
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  const t = useTranslations('pages.coach');
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-start justify-between">
        {TOULMIN_STEP_ORDER.map((step, index) => {
          const isComplete = completedSteps[step];
          const isCurrent = step === currentStep;
          const stepNumber = index + 1;
          
          // Only allow clicking on completed steps that are not current (edit previous)
          const isClickable = Boolean(onStepClick) && isComplete && !isCurrent;
          
          return (
            <li key={step} className="relative flex-1">
              {/* Connector line */}
              {index !== 0 && (
                <div
                  className={cn(
                    'absolute left-0 top-4 -ml-4 h-0.5 w-full -translate-x-1/2',
                    isComplete || isCurrent ? 'bg-blue-600' : 'bg-gray-200'
                  )}
                  aria-hidden="true"
                />
              )}
              
              <button
                type="button"
                onClick={isClickable ? () => onStepClick?.(step) : undefined}
                disabled={!isClickable}
                className={cn(
                  'group relative flex flex-col items-center',
                  isClickable ? 'cursor-pointer hover:bg-white/20' : 'cursor-default'
                )}
                aria-current={isCurrent ? 'step' : undefined}
                aria-disabled={!isClickable}
              >
                {/* Step indicator circle */}
                <span
                  className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
                    isComplete && 'bg-blue-600',
                    isCurrent && !isComplete && 'border-2 border-blue-600 bg-white',
                    !isCurrent && !isComplete && 'border-2 border-gray-300 bg-white'
                  )}
                >
                  {isComplete ? (
                    <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                  ) : isCurrent ? (
                    <EllipsisHorizontalCircleIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-medium text-gray-500">{stepNumber}</span>
                  )}
                </span>
                
                {/* Step name */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    isCurrent ? 'text-blue-600' : isComplete ? 'text-gray-900' : 'text-gray-500'
                  )}
                >
                  {t(`steps.${step}`)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export const StepIndicator = memo(StepIndicatorComponent);
