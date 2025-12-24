"use client";

import { ToulminStep } from '@/types/chat';
import { Typography } from '@/components/ui/Typography';
import { useTranslations } from 'next-intl';

interface StepFocusChipProps {
  currentStep: ToulminStep;
  className?: string;
}

export function StepFocusChip({ currentStep, className = "" }: Readonly<StepFocusChipProps>) {
  const t = useTranslations('pages.dashboard.guidedChat.steps');
  
  return (
    <div className={`inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full ${className}`}>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      <Typography variant="body-sm" className="font-medium">
        Working on: {t(currentStep)}
      </Typography>
    </div>
  );
}

