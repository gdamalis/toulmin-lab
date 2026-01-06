import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/responses';
import { withAdminAuth } from '@/lib/api/auth';
import { getAiRequestEventsCollection } from '@/lib/mongodb/collections/ai-request-events';
import { parseAiAnalyticsParams, buildMatchStage } from '../route';

/**
 * Feature breakdown data point
 */
export interface FeatureBreakdownItem {
  feature: string;
  requests: number;
  uniqueUsers: number;
  successRate: number;
}

/**
 * GET /api/analytics/ai/features
 * Get breakdown of AI requests by feature
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAdminAuth(async () => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const params = parseAiAnalyticsParams(searchParams);
      
      // Don't filter by feature for this endpoint - we want all features
      const match = buildMatchStage({
        ...params,
        feature: undefined,
      });
      
      const collection = await getAiRequestEventsCollection();
      
      // Aggregation pipeline for feature breakdown
      const pipeline = [
        { $match: match },
        {
          $group: {
            _id: '$feature',
            requests: { $sum: 1 },
            uniqueUsers: { $addToSet: '$uid' },
            successCount: {
              $sum: { $cond: [{ $eq: ['$status', 'ok'] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            feature: '$_id',
            requests: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            successRate: {
              $cond: [
                { $eq: ['$requests', 0] },
                0,
                { $multiply: [{ $divide: ['$successCount', '$requests'] }, 100] },
              ],
            },
          },
        },
        { $sort: { requests: -1 } },
      ];
      
      const breakdown = await collection.aggregate<FeatureBreakdownItem>(pipeline).toArray();
      
      // Round success rates
      const formattedBreakdown = breakdown.map(item => ({
        ...item,
        successRate: Math.round(item.successRate * 100) / 100,
      }));
      
      return createSuccessResponse({
        breakdown: formattedBreakdown,
        params: {
          from: params.fromDate.toISOString(),
          to: params.toDate.toISOString(),
          model: params.model,
        },
      });
    } catch (error) {
      console.error('Error fetching AI feature breakdown:', error);
      return createErrorResponse('Failed to fetch AI feature breakdown', 500);
    }
  })(request, context);
}
