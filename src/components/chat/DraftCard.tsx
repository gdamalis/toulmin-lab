"use client";

import { DraftState, QualifierDraft, ToulminStep } from '@/types/chat';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';

interface DraftCardProps {
  step: ToulminStep;
  draft: DraftState | QualifierDraft;
  suggestedActions: ('confirm' | 'refine' | 'skip')[];
  onConfirm: (text: string) => void;
  onRefine: () => void;
  onSkip: () => void;
  isProcessing?: boolean;
}

export function DraftCard({ 
  step, 
  draft, 
  suggestedActions,
  onConfirm, 
  onRefine, 
  onSkip,
  isProcessing = false
}: Readonly<DraftCardProps>) {
  const isQualifier = step === 'qualifier';
  
  return (
    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 my-4">
      <Typography variant="body-sm" className="font-semibold text-blue-900 mb-2">
        Draft {step}
      </Typography>
      
      {/* Draft Content */}
      <div className="bg-white rounded p-3 mb-3">
        <Typography variant="body" className="text-gray-900">
          {isQualifier ? (draft as QualifierDraft).label : (draft as DraftState).text}
        </Typography>
      </div>
      
      {/* Readiness Status */}
      <div className={`flex items-center gap-2 mb-3 ${draft.isReady ? 'text-green-700' : 'text-amber-700'}`}>
        {draft.isReady ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <Typography variant="body-sm" className="font-medium">Ready to confirm</Typography>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <Typography variant="body-sm" className="font-medium">Needs improvement</Typography>
          </>
        )}
      </div>
      
      {/* Issues */}
      {draft.issues.length > 0 && (
        <div className="mb-3">
          <Typography variant="body-sm" className="font-medium text-gray-700 mb-1">
            Issues found:
          </Typography>
          <ul className="list-disc list-inside space-y-1">
            {draft.issues.map((issue, i) => (
              <li key={i}>
                <Typography variant="body-sm" className="text-gray-600">{issue}</Typography>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Suggested Edits */}
      {draft.suggestedEdits && (
        <div className="mb-3 bg-amber-50 border border-amber-200 rounded p-2">
          <Typography variant="body-sm" className="font-medium text-amber-900 mb-1">
            Suggestion:
          </Typography>
          <Typography variant="body-sm" className="text-amber-800">
            {draft.suggestedEdits}
          </Typography>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        {suggestedActions.includes('confirm') && (
          <Button
            onClick={() => onConfirm(isQualifier ? (draft as QualifierDraft).label : (draft as DraftState).text)}
            disabled={isProcessing}
            variant="primary"
            className="flex-1"
          >
            Confirm
          </Button>
        )}
        
        {suggestedActions.includes('refine') && (
          <Button
            onClick={onRefine}
            disabled={isProcessing}
            variant="secondary"
            className="flex-1"
          >
            Refine
          </Button>
        )}
        
        {suggestedActions.includes('skip') && (
          <Button
            onClick={onSkip}
            disabled={isProcessing}
            variant="secondary"
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}

