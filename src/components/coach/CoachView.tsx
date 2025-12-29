'use client';

import { ToulminDiagram } from '@/components/diagram';
import { ChatPanel } from '@/components/coach';
import { 
  ClientChatSession, 
  ClientChatMessage, 
  ClientArgumentDraft,
} from '@/types/coach';
import { ToulminArgument } from '@/types/client';
import { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface CoachViewProps {
  session: ClientChatSession;
  messages: ClientChatMessage[];
  draft: ClientArgumentDraft;
}

export function CoachView({ session, messages, draft: initialDraft }: CoachViewProps) {
  const t = useTranslations('pages.coach');
  const [draft, setDraft] = useState<ClientArgumentDraft>(initialDraft);

  /**
   * Convert ArgumentDraft to ToulminArgument format for diagram preview
   */
  const draftToArgument = (d: ClientArgumentDraft): ToulminArgument => ({
    _id: d.id,
    name: d.name || t('untitledArgument'),
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
  });

  // Convert draft to argument format for diagram
  const argumentData = useMemo(() => draftToArgument(draft), [draft, t]);

  // Listen for draft updates from ChatPanel
  useEffect(() => {
    const handleDraftUpdate = (event: CustomEvent<ClientArgumentDraft>) => {
      setDraft(event.detail);
    };

    window.addEventListener('draftUpdated' as any, handleDraftUpdate);
    return () => {
      window.removeEventListener('draftUpdated' as any, handleDraftUpdate);
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left: Chat Panel */}
      <div className="w-1/2 flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <ChatPanel
          sessionId={session.id}
          initialMessages={messages}
          initialDraft={draft}
          initialStep={session.currentStep}
        />
      </div>

      {/* Right: Diagram Preview */}
      <div className="w-1/2 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="h-full p-4">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {t('livePreview')}
          </h3>
          <ToulminDiagram
            data={argumentData}
            showExportButtons={false}
            showControls={true}
            showTitle={false}
          />
        </div>
      </div>
    </div>
  );
}
