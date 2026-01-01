import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/responses';
import { getDraftBySessionId, updateDraftFromEditor } from '@/lib/services/coach';
import { parseRequestBody } from '@/lib/api/middleware';
import { ToulminArgumentPart } from '@/types/toulmin';

interface UpdateDraftRequest {
  name: string;
  parts: ToulminArgumentPart;
  version: number;
}

/**
 * GET /api/coach/draft/[sessionId]
 * Get a draft by session ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  return withAuth(async (_request, context, auth) => {
    try {
      const { sessionId } = await context.params;

      const result = await getDraftBySessionId(sessionId as string, auth.userId);

      if (!result.success || !result.data) {
        return createErrorResponse(result.error ?? 'Draft not found', 404);
      }

      return createSuccessResponse(result.data);
    } catch (error) {
      console.error('Error fetching draft:', error);
      return createErrorResponse('Internal Server Error', 500);
    }
  })(request, { params });
}

/**
 * PUT /api/coach/draft/[sessionId]
 * Update a draft from the diagram editor
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  return withAuth(async (request, context, auth) => {
    try {
      const { sessionId } = await context.params;
      const data = await parseRequestBody<UpdateDraftRequest>(request);

      if (!data.name || !data.parts || typeof data.version !== 'number') {
        return createErrorResponse('Invalid request data', 400);
      }

      const result = await updateDraftFromEditor(sessionId as string, auth.userId, {
        name: data.name,
        parts: data.parts,
        version: data.version,
      });

      if (!result.success) {
        return createErrorResponse(result.error ?? 'Failed to update draft', 400);
      }

      return createSuccessResponse(result.data);
    } catch (error) {
      console.error('Error updating draft:', error);
      return createErrorResponse('Internal Server Error', 500);
    }
  })(request, { params });
}
