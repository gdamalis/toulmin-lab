import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { CoachView } from '@/components/coach';
import { loadSession, getSessionStatus } from '../actions';
import { Loader } from '@/components/ui/Loader';
import { PageHeader } from '@/components/layout/PageHeader';
import { getTranslations } from 'next-intl/server';
import { SESSION_STATUS } from '@/types/coach';

interface CoachSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

async function CoachSessionContent({ sessionId }: { sessionId: string }) {
  // First, check session status to redirect completed sessions
  // This prevents 404 when draft/messages are deleted after finalization
  const statusResult = await getSessionStatus(sessionId);
  
  if (!statusResult.success || !statusResult.data) {
    notFound();
  }
  
  // Redirect to finalized argument if session is completed
  if (
    statusResult.data.status === SESSION_STATUS.COMPLETED &&
    statusResult.data.argumentId
  ) {
    redirect(`/argument/view/${statusResult.data.argumentId}`);
  }
  
  // Load full session data for active sessions
  const result = await loadSession(sessionId);
  
  if (!result.success || !result.data) {
    notFound();
  }
  
  const { session, messages, draft } = result.data;
  
  return (
    <CoachView
      session={session}
      messages={messages}
      draft={draft}
    />
  );
}

export default async function CoachSessionPage({ params }: CoachSessionPageProps) {
  const { sessionId } = await params;
  const t = await getTranslations('pages.coach');
  
  return (
    <div className="h-full">
      <PageHeader title={t('title')} />
      
      <div className="mt-4">
        <Suspense
          fallback={
            <div className="flex h-96 items-center justify-center">
              <Loader size={48} />
            </div>
          }
        >
          <CoachSessionContent sessionId={sessionId} />
        </Suspense>
      </div>
    </div>
  );
}
