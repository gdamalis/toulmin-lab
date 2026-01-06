import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/responses';
import { withAdminAuth } from '@/lib/api/auth';
import { getAiRequestEventsCollection } from '@/lib/mongodb/collections/ai-request-events';
import { parseAiAnalyticsParams, buildMatchStage } from '../route';

/**
 * Model breakdown data point
 */
export interface ModelBreakdownItem {
  /** Combined provider:model identifier */
  providerModel: string;
  provider: string;
  model: string;
  requests: number;
  uniqueUsers: number;
  successRate: number;
}

/**
 * GET /api/analytics/ai/models
 * Get breakdown of AI requests by provider:model
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
      
      const collection = await getAiRequestEventsCollection();
      
      // Aggregation pipeline for model breakdown
      const pipeline = [
        { $match: match },
        {
          $group: {
            _id: {
              provider: '$provider',
              model: '$model',
            },
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
            provider: '$_id.provider',
            model: '$_id.model',
            providerModel: { $concat: ['$_id.provider', ':', '$_id.model'] },
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
      
      const breakdown = await collection.aggregate<ModelBreakdownItem>(pipeline).toArray();
      
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
          feature: params.feature,
        },
      });
    } catch (error) {
      console.error('Error fetching AI model breakdown:', error);
      return createErrorResponse('Failed to fetch AI model breakdown', 500);
    }
  })(request, context);
}
