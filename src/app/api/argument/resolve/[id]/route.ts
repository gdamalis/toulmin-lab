import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/responses';
import { getArgumentById } from '@/lib/services/arguments';
import { resolveArgumentOrDraft, getDraftBySessionId } from '@/lib/services/coach';
import { ToulminArgument } from '@/types/client';
import { ClientArgumentDraft } from '@/types/coach';

interface ResolveResponse {
  kind: 'argument' | 'draft';
  argument?: ToulminArgument;
  draft?: ClientArgumentDraft;
}

/**
 * GET /api/argument/resolve/[id]
 * Resolves an ID to either an argument or a draft, returning the full data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (_request, context, auth) => {
    try {
      const { id } = await context.params;

      // First resolve whether this is an argument or draft
      const resolveResult = await resolveArgumentOrDraft(id as string, auth.userId);

      if (!resolveResult.success || !resolveResult.data) {
        return createErrorResponse(resolveResult.error ?? 'Not found', 404);
      }

      const resolved = resolveResult.data;

      if (resolved.kind === 'argument') {
        const argumentResult = await getArgumentById(resolved.id, auth.userId);

        if (!argumentResult.success || !argumentResult.data) {
          return createErrorResponse(argumentResult.error ?? 'Argument not found', 404);
        }

        const response: ResolveResponse = {
          kind: 'argument',
          argument: argumentResult.data,
        };

        return createSuccessResponse(response);
      } else {
        // It's a draft
        const draftResult = await getDraftBySessionId(resolved.sessionId, auth.userId);

        if (!draftResult.success || !draftResult.data) {
          return createErrorResponse(draftResult.error ?? 'Draft not found', 404);
        }

        const response: ResolveResponse = {
          kind: 'draft',
          draft: draftResult.data,
        };

        return createSuccessResponse(response);
      }
    } catch (error) {
      console.error('Error resolving argument/draft:', error);
      return createErrorResponse('Internal Server Error', 500);
    }
  })(request, { params });
}
