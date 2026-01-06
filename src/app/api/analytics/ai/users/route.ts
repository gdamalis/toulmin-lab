import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/responses';
import { withAdminAuth } from '@/lib/api/auth';
import { getAiRequestEventsCollection } from '@/lib/mongodb/collections/ai-request-events';
import { parseAiAnalyticsParams, buildMatchStage } from '../route';

/**
 * User usage data point
 */
export interface UserUsageItem {
  uid: string;
  requests: number;
  successCount: number;
  errorCount: number;
  lastRequestAt: string;
}

/**
 * GET /api/analytics/ai/users
 * Get top users by AI request count (paginated)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAdminAuth(async () => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const params = parseAiAnalyticsParams(searchParams);
      const match = buildMatchStage(params);
      
      // Pagination params
      const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10));
      const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get('limit') ?? '20', 10)));
      const skip = (page - 1) * limit;
      
      const collection = await getAiRequestEventsCollection();
      
      // Aggregation pipeline for user leaderboard
      const pipeline = [
        { $match: { ...match, uid: { $ne: null } } }, // Exclude null UIDs
        {
          $group: {
            _id: '$uid',
            requests: { $sum: 1 },
            successCount: {
              $sum: { $cond: [{ $eq: ['$status', 'ok'] }, 1, 0] },
            },
            errorCount: {
              $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] },
            },
            lastRequestAt: { $max: '$ts' },
          },
        },
        {
          $project: {
            _id: 0,
            uid: '$_id',
            requests: 1,
            successCount: 1,
            errorCount: 1,
            lastRequestAt: { $dateToString: { format: '%Y-%m-%dT%H:%M:%S.%LZ', date: '$lastRequestAt' } },
          },
        },
        { $sort: { requests: -1 } },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            total: [{ $count: 'count' }],
          },
        },
      ];
      
      const result = await collection.aggregate<{
        data: UserUsageItem[];
        total: [{ count: number }] | [];
      }>(pipeline).toArray();
      
      const users = result[0]?.data ?? [];
      const totalCount = result[0]?.total[0]?.count ?? 0;
      const totalPages = Math.ceil(totalCount / limit);
      
      return createSuccessResponse({
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        params: {
          from: params.fromDate.toISOString(),
          to: params.toDate.toISOString(),
          feature: params.feature,
          model: params.model,
        },
      });
    } catch (error) {
      console.error('Error fetching AI user analytics:', error);
      return createErrorResponse('Failed to fetch AI user analytics', 500);
    }
  })(request, context);
}
