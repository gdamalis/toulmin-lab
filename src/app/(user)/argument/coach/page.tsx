import { redirect } from 'next/navigation';
import { createSession } from './actions';

// Force dynamic rendering since we create a session on every visit
export const dynamic = 'force-dynamic';

/**
 * Coach landing page - creates a new session and redirects
 * This is a Server Component that handles session creation
 */
export default async function CoachPage() {
  const result = await createSession();
  
  if (!result.success || !result.data) {
    // If session creation fails, redirect to dashboard with error
    redirect('/dashboard?error=coach_session_failed');
  }
  
  // Redirect to the session page
  redirect(`/argument/coach/${result.data.sessionId}`);
}
