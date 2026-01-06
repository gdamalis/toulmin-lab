import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/responses';
import { getUserArguments } from '@/lib/services/arguments';
import { getUserDraftOverviews } from '@/lib/services/coach';

/**
 * GET /api/argument/overview
 * Returns both completed arguments and active drafts for the dashboard
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAuth(async (_request, _context, auth) => {
    try {
      const [argumentsResult, draftsResult] = await Promise.all([
        getUserArguments(auth.userId),
        getUserDraftOverviews(auth.userId),
      ]);

      if (!argumentsResult.success) {
        return createErrorResponse(
          argumentsResult.error ?? 'Failed to fetch arguments',
          500
        );
      }

      if (!draftsResult.success) {
        return createErrorResponse(
          draftsResult.error ?? 'Failed to fetch drafts',
          500
        );
      }

      return createSuccessResponse({
        arguments: argumentsResult.data,
        drafts: draftsResult.data,
      });
    } catch (error) {
      console.error('Error fetching argument overview:', error);
      return createErrorResponse('Internal Server Error', 500);
    }
  })(request, context);
}
