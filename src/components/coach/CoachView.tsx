'use client';

import { ToulminDiagram } from '@/components/diagram';
import { ChatPanel, CoachUsageMeter } from '@/components/coach';
import { 
  ClientChatSession, 
  ClientChatMessage, 
  ClientArgumentDraft,
} from '@/types/coach';
import { ToulminArgument } from '@/types/client';
import { getToulminDiagramKey } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics/track';
import { useMemo, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CoachProvider, useCoach } from '@/contexts/CoachContext';

interface CoachViewProps {
  readonly session: ClientChatSession;
  readonly messages: ClientChatMessage[];
  readonly draft: ClientArgumentDraft;
}

export function CoachView({ session, messages, draft }: CoachViewProps) {
  return (
    <CoachProvider initialDraft={draft}>
      <CoachViewContent session={session} messages={messages} />
    </CoachProvider>
  );
}

interface CoachViewContentProps {
  readonly session: ClientChatSession;
  readonly messages: ClientChatMessage[];
}

function CoachViewContent({ session, messages }: CoachViewContentProps) {
  const t = useTranslations('pages.coach');
  const { draft } = useCoach();

  // Track coach view on mount
  useEffect(() => {
    trackEvent("coach_open_view", { step: session.currentStep });
  }, [session.currentStep]);

  /**
   * Convert ArgumentDraft to ToulminArgument format for diagram preview
   */
  const draftToArgument = useCallback((d: ClientArgumentDraft): ToulminArgument => ({
    _id: d.id,
    name: d.name?.trim() || t('untitledArgument'),
    author: {
      _id: '',
      userId: '',
      name: '',
    },
    parts: {
      claim: d.claim || t('preview.claim'),
      grounds: d.grounds || t('preview.grounds'),
      warrant: d.warrant || t('preview.warrant'),
      groundsBacking: d.groundsBacking || t('preview.groundsBacking'),
      warrantBacking: d.warrantBacking || t('preview.warrantBacking'),
      qualifier: d.qualifier || t('preview.qualifier'),
      rebuttal: d.rebuttal || t('preview.rebuttal'),
    },
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }), [t]);

  // Convert draft to argument format for diagram - memoized
  const argumentData = useMemo(() => draftToArgument(draft), [draftToArgument, draft]);

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4">
      {/* Left: Chat Panel */}
      <div className="w-1/2 flex flex-col gap-3">
        {/* Usage meter at top */}
        <CoachUsageMeter />
        
        {/* Chat interface */}
        <div className="flex-1 flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <ChatPanel
            sessionId={session.id}
            initialMessages={messages}
            initialStep={session.currentStep}
          />
        </div>
      </div>

      {/* Right: Diagram Preview */}
      <div className="w-1/2 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="h-full p-4 flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 truncate" title={argumentData.name}>
              {argumentData.name}
            </h2>
            <p className="text-sm text-gray-500">{t('livePreview')}</p>
          </div>
          <div className="flex-1">
            <ToulminDiagram
              key={getToulminDiagramKey(draft)}
              data={argumentData}
              showExportButtons={false}
              showControls={true}
              showTitle={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
