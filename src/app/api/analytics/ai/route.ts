import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/responses';
import { withAdminAuth } from '@/lib/api/auth';
import { 
  getAiRequestEventsCollection,
  AI_REQUEST_STATUS,
} from '@/lib/mongodb/collections/ai-request-events';

/**
 * Query parameters for AI analytics endpoints
 */
export interface AiAnalyticsQueryParams {
  /** Start date (ISO string, defaults to 14 days ago) */
  from?: string;
  /** End date (ISO string, defaults to now) */
  to?: string;
  /** Filter by feature (e.g., coach_chat, coach_title) */
  feature?: string;
  /** Filter by provider:model (e.g., gemini:gemini-2.0-flash) */
  model?: string;
  /** Filter by status */
  status?: string;
}

/**
 * Parse query parameters with defaults
 */
export function parseAiAnalyticsParams(
  searchParams: URLSearchParams
): AiAnalyticsQueryParams & { fromDate: Date; toDate: Date } {
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days ago
  
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  
  const fromDate = fromParam ? new Date(fromParam) : defaultFrom;
  const toDate = toParam ? new Date(toParam) : now;
  
  return {
    from: fromParam ?? undefined,
    to: toParam ?? undefined,
    feature: searchParams.get('feature') ?? undefined,
    model: searchParams.get('model') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    fromDate,
    toDate,
  };
}

/**
 * Build MongoDB match stage from query parameters
 */
export function buildMatchStage(
  params: ReturnType<typeof parseAiAnalyticsParams>
): Record<string, unknown> {
  const match: Record<string, unknown> = {
    ts: {
      $gte: params.fromDate,
      $lte: params.toDate,
    },
  };
  
  if (params.feature) {
    match.feature = params.feature;
  }
  
  if (params.model) {
    // Parse "provider:model" format
    const [provider, model] = params.model.split(':');
    if (provider) match.provider = provider;
    if (model) match.model = model;
  }
  
  if (params.status) {
    match.status = params.status;
  }
  
  return match;
}

/**
 * Daily time series data point
 */
export interface DailyDataPoint {
  date: string; // YYYY-MM-DD
  requests: number;
  uniqueUsers: number;
  successCount: number;
  errorCount: number;
  quotaDeniedCount: number;
  rateLimitedCount: number;
}

/**
 * GET /api/analytics/ai
 * Get daily time series of AI requests with optional filters
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
      
      // Aggregation pipeline for daily stats
      const pipeline = [
        { $match: match },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$ts' } },
            },
            requests: { $sum: 1 },
            uniqueUsers: { $addToSet: '$uid' },
            successCount: {
              $sum: { $cond: [{ $eq: ['$status', AI_REQUEST_STATUS.OK] }, 1, 0] },
            },
            errorCount: {
              $sum: { $cond: [{ $eq: ['$status', AI_REQUEST_STATUS.ERROR] }, 1, 0] },
            },
            quotaDeniedCount: {
              $sum: { $cond: [{ $eq: ['$status', AI_REQUEST_STATUS.QUOTA_DENIED] }, 1, 0] },
            },
            rateLimitedCount: {
              $sum: { $cond: [{ $eq: ['$status', AI_REQUEST_STATUS.RATE_LIMITED] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id.date',
            requests: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            successCount: 1,
            errorCount: 1,
            quotaDeniedCount: 1,
            rateLimitedCount: 1,
          },
        },
        { $sort: { date: 1 } },
      ];
      
      const dailyData = await collection.aggregate<DailyDataPoint>(pipeline).toArray();
      
      // Calculate totals
      const totals = dailyData.reduce(
        (acc, day) => ({
          totalRequests: acc.totalRequests + day.requests,
          totalSuccess: acc.totalSuccess + day.successCount,
          totalErrors: acc.totalErrors + day.errorCount,
          totalQuotaDenied: acc.totalQuotaDenied + day.quotaDeniedCount,
          totalRateLimited: acc.totalRateLimited + day.rateLimitedCount,
        }),
        { totalRequests: 0, totalSuccess: 0, totalErrors: 0, totalQuotaDenied: 0, totalRateLimited: 0 }
      );
      
      // Get unique users across the period
      const uniqueUsersPipeline = [
        { $match: match },
        { $group: { _id: '$uid' } },
        { $count: 'count' },
      ];
      const uniqueUsersResult = await collection.aggregate<{ count: number }>(uniqueUsersPipeline).toArray();
      const totalUniqueUsers = uniqueUsersResult[0]?.count ?? 0;
      
      return createSuccessResponse({
        series: dailyData,
        totals: {
          ...totals,
          totalUniqueUsers,
        },
        params: {
          from: params.fromDate.toISOString(),
          to: params.toDate.toISOString(),
          feature: params.feature,
          model: params.model,
          status: params.status,
        },
      });
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
      return createErrorResponse('Failed to fetch AI analytics', 500);
    }
  })(request, context);
}
