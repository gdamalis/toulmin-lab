import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { parseRequestBody } from "@/lib/api/middleware";
import { withAuth } from "@/lib/api/auth";
import { generateArgumentFromText, getProviderRateLimit } from "@/lib/services/ai";
import { validateAIArgumentRequest } from "@/lib/validation/ai";
import { AIArgumentRequest, AIServiceError } from "@/types/ai";

/**
 * POST /api/ai/generate - Generate a Toulmin argument from free text
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAuth(async (request, _context, auth) => {
    try {
      // Parse and validate request body
      const body = await parseRequestBody(request);
      const validation = validateAIArgumentRequest(body);
      
      if (!validation.success) {
        return createErrorResponse(
          Array.isArray(validation.error) 
            ? validation.error[0]?.message ?? 'Invalid request format'
            : validation.error ?? 'Invalid request format',
          400
        );
      }

      const validatedData = validation.data!; // We know it's defined because validation.success is true
      const aiRequest: AIArgumentRequest = {
        prompt: validatedData.prompt,
        context: validatedData.context,
        language: validatedData.language,
        userId: auth.userId
      };

      // Check rate limits before processing
      const rateLimitInfo = getProviderRateLimit('gemini');
      if (rateLimitInfo && rateLimitInfo.remaining <= 0) {
        return createErrorResponse(
          'Rate limit exceeded. Please try again later.',
          429
        );
      }

      // Generate the argument
      const result = await generateArgumentFromText(aiRequest);
      
      if (!result.success) {
        // Handle AI-specific errors
        if (result.error?.includes('Rate limit')) {
          return createErrorResponse(result.error, 429);
        }
        
        if (result.error?.includes('Network error')) {
          return createErrorResponse(result.error, 503);
        }
        
        return createErrorResponse(result.error ?? 'Failed to generate argument', 500);
      }

      // Get updated rate limit info
      const updatedRateLimitInfo = getProviderRateLimit('gemini');
      
      return createSuccessResponse({
        argument: result.data?.argument,
        confidence: result.data?.confidence,
        reasoning: result.data?.reasoning,
        suggestions: result.data?.suggestions,
        rateLimitInfo: updatedRateLimitInfo ? {
          remaining: updatedRateLimitInfo.remaining,
          resetTime: updatedRateLimitInfo.resetTime
        } : undefined
      });

    } catch (error) {
      console.error('Error in AI generation endpoint:', error);
      
      // Handle AI service errors
      if (error && typeof error === 'object' && 'type' in error) {
        const aiError = error as AIServiceError;
        
                 switch (aiError.type) {
           case 'RATE_LIMIT_EXCEEDED':
             return createErrorResponse(aiError.message, 429);
           case 'NETWORK_ERROR':
             return createErrorResponse(aiError.message, 503);
           case 'PROVIDER_ERROR':
             return createErrorResponse(aiError.message, 502);
           case 'CONFIGURATION_ERROR':
             return createErrorResponse('AI service configuration error', 500);
           default:
             return createErrorResponse(aiError.message, 500);
         }
      }
      
      return createErrorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500
      );
    }
  })(request, context);
}

/**
 * GET /api/ai/generate - Get AI generation status and rate limit info
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAuth(async () => {
    try {
      // Get rate limit information
      const rateLimitInfo = getProviderRateLimit('gemini');
      
      if (!rateLimitInfo) {
        return createErrorResponse('AI service not available', 503);
      }

      return createSuccessResponse({
        provider: rateLimitInfo.provider,
        available: true,
        rateLimitInfo: {
          remaining: rateLimitInfo.remaining,
          resetTime: rateLimitInfo.resetTime,
          maxRequestsPerMinute: rateLimitInfo.config.requestsPerMinute
        }
      });

    } catch (error) {
      console.error('Error getting AI generation status:', error);
      return createErrorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500
      );
    }
  })(request, context);
} 