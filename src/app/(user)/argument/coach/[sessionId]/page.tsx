import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CoachView } from '@/components/coach';
import { loadSession } from '../actions';
import { Loader } from '@/components/ui/Loader';
import { PageHeader } from '@/components/layout/PageHeader';
import { getTranslations } from 'next-intl/server';

interface CoachSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

async function CoachSessionContent({ sessionId }: { sessionId: string }) {
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
