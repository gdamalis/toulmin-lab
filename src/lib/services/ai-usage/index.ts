import {
  insertAiRequestEvent,
  type AiRequestStatus,
  type AiFeature,
} from '@/lib/mongodb/collections/ai-request-events';

export { 
  AI_REQUEST_STATUS, 
  AI_FEATURE,
  type AiRequestStatus,
  type AiFeature,
} from '@/lib/mongodb/collections/ai-request-events';

/**
 * Parameters for logging an AI request
 */
export interface LogAiRequestParams {
  /** Firebase uid of the user (null for anonymous/system) */
  uid: string | null;
  /** Feature identifier */
  feature: AiFeature;
  /** AI provider name (e.g., gemini, openai, anthropic) */
  provider: string;
  /** Full model identifier (e.g., gemini-2.0-flash) */
  model: string;
  /** Request status */
  status: AiRequestStatus;
  /** Duration in milliseconds (optional) */
  durationMs?: number;
  /** Optional coach session ID for correlation */
  sessionId?: string;
}

/**
 * Log an AI request event for analytics
 * 
 * This is a fire-and-forget operation that does not block the calling code.
 * Errors are logged but not thrown to avoid impacting the main flow.
 * 
 * @param params - The request parameters to log
 */
export function logAiRequest(params: LogAiRequestParams): void {
  // Fire-and-forget: don't await, don't block the caller
  insertAiRequestEvent({
    uid: params.uid,
    feature: params.feature,
    provider: params.provider,
    model: params.model,
    status: params.status,
    durationMs: params.durationMs ?? null,
    sessionId: params.sessionId,
  }).catch((error) => {
    // Log but don't throw - analytics should never break the main flow
    console.error('[logAiRequest] Failed to log AI request event:', error);
  });
}

/**
 * Helper to create a timer for measuring request duration
 * 
 * @returns Object with elapsed() method that returns milliseconds since creation
 */
export function createRequestTimer(): { elapsed: () => number } {
  const startTime = performance.now();
  return {
    elapsed: () => Math.round(performance.now() - startTime),
  };
}

/**
 * Helper to format provider and model as a combined string
 * Format: "provider:model" (e.g., "gemini:gemini-2.0-flash")
 * 
 * @param provider - The AI provider name
 * @param model - The model identifier
 * @returns Combined string in "provider:model" format
 */
export function formatProviderModel(provider: string, model: string): string {
  return `${provider}:${model}`;
}
