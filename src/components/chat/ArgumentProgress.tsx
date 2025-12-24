"use client";

import { ToulminStep, ArgumentProgress as ArgumentProgressType } from '@/types/chat';
import { Typography } from '@/components/ui/Typography';
import { useTranslations, useLocale } from 'next-intl';
import { getStepInfo } from '@/lib/services/chat-ai';
import { Locale } from '@/i18n/settings';

interface ArgumentProgressProps {
  currentStep: ToulminStep;
  argumentProgress: ArgumentProgressType;
  className?: string;
}

export function ArgumentProgress({ 
  currentStep, 
  argumentProgress, 
  className = "" 
}: Readonly<ArgumentProgressProps>) {
  const t = useTranslations('pages.argument');
  const dashboardT = useTranslations('pages.dashboard');
  const locale = useLocale() as Locale;
  
  const steps = getStepInfo(currentStep, argumentProgress, locale);
  const completedSteps = steps.filter(step => step.isCompleted).length;
  const totalSteps = steps.length - 1; // Exclude 'complete' step
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <Typography variant="h3" className="text-lg font-semibold text-gray-900 mb-2">
          {dashboardT("guidedChat.progress.title")}
        </Typography>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <Typography variant="body-sm" textColor="muted">
          {dashboardT("guidedChat.progress.stepsCompleted", {
            completed: completedSteps,
            total: totalSteps,
            percentage: progressPercentage
          })}
        </Typography>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.filter(step => step.step !== 'done').map((stepInfo) => (
          <div 
            key={stepInfo.step}
            className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
              stepInfo.isActive 
                ? 'bg-blue-50 border border-blue-200' 
                : stepInfo.isCompleted 
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
            }`}
          >
            {/* Step Icon */}
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              stepInfo.isCompleted
                ? 'bg-green-500 text-white'
                : stepInfo.isActive
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-600'
            }`}>
              {stepInfo.isCompleted ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                getStepNumber(stepInfo.step)
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <Typography 
                variant="body" 
                className={`font-medium ${
                  stepInfo.isActive ? 'text-blue-900' : 'text-gray-900'
                }`}
              >
                {stepInfo.title}
              </Typography>
              <Typography 
                variant="body-sm" 
                className={`mt-1 ${
                  stepInfo.isActive ? 'text-blue-700' : 'text-gray-600'
                }`}
              >
                {stepInfo.description}
              </Typography>
              
              {/* Show progress content if completed */}
              {stepInfo.isCompleted && (
                <div className="mt-2 p-2 bg-white rounded border">
                  <Typography variant="body-sm" textColor="muted" className="mb-1 text-xs">
                    {dashboardT("guidedChat.progress.completed")}
                  </Typography>
                  <Typography variant="body-sm" className="text-gray-800">
                    {getStepContent(stepInfo.step, argumentProgress)}
                  </Typography>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Current Argument Summary */}
      {argumentProgress.topic && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Typography variant="body-sm" className="font-medium text-gray-900 mb-2">
            {dashboardT("guidedChat.progress.currentTopic")}
          </Typography>
          <Typography variant="body-sm" className="text-gray-700 bg-gray-50 p-2 rounded">
            {argumentProgress.topic}
          </Typography>
        </div>
      )}
    </div>
  );
}

/**
 * Get step number for display
 */
function getStepNumber(step: ToulminStep): number {
  const stepOrder: ToulminStep[] = ['intro', 'claim', 'warrant', 'warrantBacking', 'grounds', 'groundsBacking', 'qualifier', 'rebuttal'];
  return stepOrder.indexOf(step) + 1;
}

/**
 * Get completed content for a step
 */
function getStepContent(step: ToulminStep, progress: ArgumentProgressType): string {
  switch (step) {
    case 'intro':
      return progress.topic || 'Topic defined';
    case 'claim':
      return progress.claim || 'Claim defined';
    case 'warrant':
      return progress.warrant || 'Warrant defined';
    case 'warrantBacking':
      return progress.warrantBacking || 'Warrant backing defined';
    case 'grounds':
      return progress.grounds || 'Grounds defined';
    case 'groundsBacking':
      return progress.groundsBacking || 'Grounds backing defined';
    case 'qualifier':
      return progress.qualifier || 'Qualifier defined';
    case 'rebuttal':
      return progress.rebuttal || 'Rebuttal defined';
    default:
      return 'Completed';
  }
}
