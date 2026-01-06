import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/responses';
import { getCoachQuotaStatus } from '@/lib/services/coach/quota';

/**
 * GET /api/coach/quota
 * Get current coach quota status for the authenticated user
 * Does not consume quota - purely for UI gating and display
 */
export async function GET(request: NextRequest) {
  return withAuth(async (_request, _context, auth) => {
    try {
      const status = await getCoachQuotaStatus(auth.userId, auth.role);
      
      return createSuccessResponse({
        used: status.used,
        limit: status.limit,
        remaining: status.remaining,
        resetAt: status.resetAt.toISOString(),
        isUnlimited: status.isUnlimited,
      });
    } catch (error) {
      console.error('Error fetching coach quota:', error);
      return createErrorResponse('Failed to fetch quota status', 500);
    }
  })(request, { params: Promise.resolve({}) });
}

