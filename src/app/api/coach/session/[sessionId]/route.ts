import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/responses';
import { deleteCoachSessionAndDraft } from '@/lib/services/coach';

/**
 * DELETE /api/coach/session/[sessionId]
 * Delete a coach session and its associated draft and messages
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  return withAuth(async (_request, context, auth) => {
    try {
      const { sessionId } = await context.params;

      const result = await deleteCoachSessionAndDraft(sessionId as string, auth.userId);

      if (!result.success) {
        return createErrorResponse(result.error ?? 'Failed to delete session', 404);
      }

      return createSuccessResponse({ success: true });
    } catch (error) {
      console.error('Error deleting coach session:', error);
      return createErrorResponse('Internal Server Error', 500);
    }
  })(request, { params });
}
