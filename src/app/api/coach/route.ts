import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { streamObject } from 'ai';
import { withAuth } from '@/lib/api/auth';
import { createErrorResponse } from '@/lib/api/responses';
import { parseRequestBody } from '@/lib/api/middleware';
import { checkRateLimit, COACH_RATE_LIMIT, createRateLimitHeaders } from '@/lib/api/rateLimit';
import { validateChatRequest, CoachAIResultSchema, CoachAIResultStreamSchema } from '@/lib/validation/coach';
import { getCoachProvider } from '@/lib/ai/providers';
import { getCoachSystemPrompt, SupportedLocale, StepInfo } from '@/lib/ai/prompts/coachSystemPrompt';
import { 
  getCoachSessionsCollection, 
  getCoachMessagesCollection,
  getArgumentDraftsCollection,
} from '@/lib/mongodb/collections/coach';
import { 
  ChatMessage, 
  ArgumentDraft,
  ToulminStep,
} from '@/types/coach';
import { getLocale, getTranslations } from 'next-intl/server';
import { 
  coerceResultToCurrentStep, 
  trySalvageCoachResult 
} from '@/lib/coach/coercion';
import { consumeCoachMonthlyQuota } from '@/lib/services/coach/quota';
import { 
  logAiRequest, 
  createRequestTimer, 
  AI_REQUEST_STATUS, 
  AI_FEATURE 
} from '@/lib/services/ai-usage';

/**
 * Patterns for sanitizing user input to prevent prompt injection
 */
const INJECTION_PATTERNS = [
  /ignore (previous|all|above) instructions/gi,
  /you are now/gi,
  /new instructions:/gi,
  /system:/gi,
  /\[SYSTEM\]/gi,
  /\[INST\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
];

/**
 * Max character length for user messages
 */
const MAX_USER_MESSAGE_LENGTH = 5000;

/**
 * Max total characters for conversation history (budget)
 */
const MAX_HISTORY_CHARS = 20000;

/**
 * Sanitize user input to prevent prompt injection
 */
function sanitizeUserInput(input: string): string {
  let sanitized = input;
  INJECTION_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '[FILTERED]');
  });
  
  // Limit length
  return sanitized.substring(0, MAX_USER_MESSAGE_LENGTH);
}

/**
 * Sanitize and budget conversation history
 * Applies sanitization to all user messages and limits total character budget
 */
function sanitizeConversationHistory(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Array<{ role: 'user' | 'assistant'; content: string }> {
  // First sanitize all user messages
  const sanitizedMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.role === 'user' 
      ? sanitizeUserInput(msg.content) 
      : msg.content.substring(0, MAX_USER_MESSAGE_LENGTH), // Also limit assistant messages
  }));
  
  // Apply character budget (keep most recent messages that fit)
  let totalChars = 0;
  const budgetedMessages: typeof sanitizedMessages = [];
  
  // Process in reverse (most recent first) to keep recent context
  for (let i = sanitizedMessages.length - 1; i >= 0; i--) {
    const msg = sanitizedMessages[i];
    const msgLength = msg.content.length;
    
    if (totalChars + msgLength <= MAX_HISTORY_CHARS) {
      budgetedMessages.unshift(msg);
      totalChars += msgLength;
    } else {
      // Budget exceeded, stop including older messages
      break;
    }
  }
  
  return budgetedMessages;
}

/**
 * Detect if the user message indicates a rewrite/improve request
 * This helps the AI understand when to propose text updates
 */
function detectRewriteIntent(message: string): boolean {
  const rewritePatterns = [
    /\b(rewrite|re-write|rephrase|re-phrase|improve|fix|help me word|reword|re-word)\b/i,
    /\b(reescrib|reescribe|mejora|arregla|ayúdame a redactar|reformula)\b/i, // Spanish
    /\b(can you|could you|please).*(write|rewrite|improve|fix|rephrase)/i,
    /\b(puedes|podrías|por favor).*(escribir|reescribir|mejorar|arreglar)/i, // Spanish
  ];
  
  return rewritePatterns.some((pattern) => pattern.test(message));
}

/**
 * Validate the final coerced result against the strict schema
 * Returns an error message if validation fails, null if valid
 */
function validateCoachResult(
  result: Record<string, unknown>,
  sessionCurrentStep: ToulminStep
): string | null {
  // Validate with strict schema
  const parsed = CoachAIResultSchema.safeParse(result);
  
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    console.error(`Coach result validation failed: ${issues}`);
    return 'coach_validation_failed';
  }

  // Additional business rule checks
  const data = parsed.data;

  // assistantText must be non-empty
  if (!data.assistantText || data.assistantText.trim() === '') {
    console.error('Coach result has empty assistantText');
    return 'coach_empty_response';
  }

  // step must match session
  if (data.step !== sessionCurrentStep) {
    console.error(`Coach result step '${data.step}' doesn't match session '${sessionCurrentStep}'`);
    return 'coach_step_mismatch';
  }

  return null;
}

/**
 * POST /api/coach
 * Stream AI coach response
 */
export async function POST(request: NextRequest) {
  return withAuth(async (request, _context, auth) => {
    // Get provider info early for logging (even on denied requests)
    const provider = getCoachProvider();
    const providerName = provider.getProviderName();
    const modelId = provider.getModelId();
    
    // Monthly quota check (before any AI call to control costs)
    const quotaResult = await consumeCoachMonthlyQuota(auth.userId, auth.role);
    
    if (!quotaResult.allowed) {
      // Log quota denied event
      logAiRequest({
        uid: auth.userId,
        feature: AI_FEATURE.COACH_CHAT,
        provider: providerName,
        model: modelId,
        status: AI_REQUEST_STATUS.QUOTA_DENIED,
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'monthly_quota_exceeded',
          resetAt: quotaResult.resetAt.toISOString(),
          limit: quotaResult.limit,
          used: quotaResult.used,
        }),
        { 
          status: 429, 
          headers: {
            'Content-Type': 'application/json',
            'X-Coach-Quota-Limit': String(quotaResult.limit ?? 'unlimited'),
            'X-Coach-Quota-Remaining': String(quotaResult.remaining ?? 'unlimited'),
            'X-Coach-Quota-Used': String(quotaResult.used),
            'X-Coach-Quota-Reset': quotaResult.resetAt.toISOString(),
          },
        }
      );
    }
    
    // Short-window rate limiting (UX protection)
    const rateLimitResult = checkRateLimit(auth.userId, COACH_RATE_LIMIT);
    
    if (!rateLimitResult.allowed) {
      // Log rate limited event
      logAiRequest({
        uid: auth.userId,
        feature: AI_FEATURE.COACH_CHAT,
        provider: providerName,
        model: modelId,
        status: AI_REQUEST_STATUS.RATE_LIMITED,
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please wait before sending another message.',
          retryAfter: rateLimitResult.retryAfter,
        }),
        { 
          status: 429, 
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(rateLimitResult),
            'X-Coach-Quota-Limit': String(quotaResult.limit ?? 'unlimited'),
            'X-Coach-Quota-Remaining': String(quotaResult.remaining ?? 'unlimited'),
            'X-Coach-Quota-Used': String(quotaResult.used),
            'X-Coach-Quota-Reset': quotaResult.resetAt.toISOString(),
          },
        }
      );
    }

    // Start request timer for duration tracking
    const requestTimer = createRequestTimer();

    try {
      // Parse and validate request
      const body = await parseRequestBody<{ sessionId: string; message: string }>(request);
      const validation = validateChatRequest(body);
      
      if (!validation.success) {
        return createErrorResponse('Invalid request data', 400);
      }

      const { sessionId, message } = validation.data;

      // Validate session ID
      if (!ObjectId.isValid(sessionId)) {
        return createErrorResponse('Invalid session ID', 400);
      }

      const objectId = new ObjectId(sessionId);

      // Fetch session, messages, and draft
      const [sessionsCol, messagesCol, draftsCol] = await Promise.all([
        getCoachSessionsCollection(),
        getCoachMessagesCollection(),
        getArgumentDraftsCollection(),
      ]);

      const [session, draft, recentMessages] = await Promise.all([
        sessionsCol.findOne({ _id: objectId, userId: auth.userId }),
        draftsCol.findOne({ sessionId: objectId, userId: auth.userId }),
        messagesCol
          .find({ sessionId: objectId })
          .sort({ createdAt: -1 })
          .limit(10)
          .toArray(),
      ]);

      if (!session) {
        return createErrorResponse('Session not found', 404);
      }

      if (!draft) {
        return createErrorResponse('Draft not found', 404);
      }

      // Save user message
      const userMessage: Omit<ChatMessage, '_id'> = {
        sessionId: objectId,
        role: 'user',
        content: message,
        createdAt: new Date(),
        step: session.currentStep,
      };
      await messagesCol.insertOne(userMessage as ChatMessage);

      // Build conversation history, filtering out invalid messages and applying sanitization
      const reversedMessages = [...recentMessages].reverse();
      const rawHistory = reversedMessages
        .filter((msg) => 
          typeof msg.content === 'string' && 
          msg.content.trim() !== '' &&
          (msg.role === 'user' || msg.role === 'assistant')
        )
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));
      
      // Sanitize all messages and apply character budget
      const conversationHistory = sanitizeConversationHistory(rawHistory);

      // Sanitize user input
      const sanitizedMessage = sanitizeUserInput(message);

      // Detect if user is requesting a rewrite/improvement
      const isRewriteRequest = detectRewriteIntent(message);

      // Get locale for AI response language
      const rawLocale = await getLocale();
      const locale: SupportedLocale = rawLocale === 'es' ? 'es' : 'en';

      // Get localized step info from translations
      const t = await getTranslations('pages.coach');
      const currentStep = session.currentStep;
      const stepInfo: StepInfo = {
        definition: t(`stepInfo.${currentStep}.definition`),
        example: t(`stepInfo.${currentStep}.example`),
        antiPattern: t(`stepInfo.${currentStep}.antiPattern`),
      };

      // Get AI model and system prompt (provider already obtained above)
      const model = provider.getModel();
      const systemPrompt = getCoachSystemPrompt(currentStep, draft as ArgumentDraft, locale, stepInfo);

      // Get current draft field value
      const draftFieldValue = (draft[currentStep] as string) ?? '';

      // Detect if this is the first user turn for the current step
      // Count prior user messages for this step (excluding the message we just inserted)
      const priorUserMessagesForStep = recentMessages.filter(
        (msg) => msg.role === 'user' && msg.step === currentStep
      );
      const isFirstAttemptForStep = priorUserMessagesForStep.length === 0;

      // Build messages for AI, including context hints based on situation
      let userContent = sanitizedMessage;
      
      if (isRewriteRequest) {
        // User explicitly requested rewrite - allow proposedUpdate
        userContent = `[CONTEXT: User is requesting a rewrite/improvement of their text. If the current step field has content, propose an improved version in proposedUpdate.]\n\n${sanitizedMessage}`;
      } else if (isFirstAttemptForStep) {
        // First user turn for this step - bias toward coaching feedback
        userContent = `[CONTEXT: This is the user's first attempt for this step. Prefer coaching feedback and a guiding question (Pattern A response). Only include proposedUpdate if the text is already excellent and you are very confident (confidence >= 0.8).]\n\n${sanitizedMessage}`;
      }

      const messages = [
        ...conversationHistory,
        { role: 'user' as const, content: userContent },
      ];

      // Stream the response using streamObject with lenient schema
      // Coercion and strict validation happen after streaming completes
      const result = streamObject({
        model,
        schema: CoachAIResultStreamSchema,
        system: systemPrompt,
        messages,
        temperature: 0.7,
      });

      // Create NDJSON stream for client consumption
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Stream partial objects as they arrive
            for await (const partial of result.partialObjectStream) {
              const line = JSON.stringify(partial) + '\n';
              controller.enqueue(encoder.encode(line));
            }
            
            // Emit final complete object, coerced to match session's current step
            const rawFinalObject = await result.object;
            const coercedFinal = coerceResultToCurrentStep(
              rawFinalObject as unknown as Record<string, unknown>,
              currentStep,
              draftFieldValue,
              locale,
              isFirstAttemptForStep,
              isRewriteRequest
            );

            // Validate the coerced result
            const validationError = validateCoachResult(coercedFinal, currentStep);
            if (validationError) {
              const errorLine = JSON.stringify({ error: validationError }) + '\n';
              controller.enqueue(encoder.encode(errorLine));
              controller.close();
              return;
            }

            // Ensure user always sees a guiding question by appending nextQuestion to assistantText
            let assistantText = coercedFinal.assistantText as string;
            const nextQuestion = coercedFinal.nextQuestion as string | undefined;
            
            if (nextQuestion && nextQuestion.trim() !== '') {
              // Append question to assistantText so it's always visible to user
              assistantText = `${assistantText}\n\n${nextQuestion.trim()}`;
              coercedFinal.assistantText = assistantText;
            }

            // Persist assistant message server-side (eliminates out-of-band client persistence)
            const assistantMessage: Omit<ChatMessage, '_id'> = {
              sessionId: objectId,
              role: 'assistant',
              content: assistantText,
              createdAt: new Date(),
              step: currentStep,
            };
            const insertResult = await messagesCol.insertOne(assistantMessage as ChatMessage);
            const assistantMessageId = insertResult.insertedId.toString();

            // Include assistantMessageId in final response for reconciliation
            const finalWithId = { ...coercedFinal, assistantMessageId };
            const finalLine = JSON.stringify(finalWithId) + '\n';
            controller.enqueue(encoder.encode(finalLine));
            
            // Log successful AI request
            logAiRequest({
              uid: auth.userId,
              feature: AI_FEATURE.COACH_CHAT,
              provider: providerName,
              model: modelId,
              status: AI_REQUEST_STATUS.OK,
              durationMs: requestTimer.elapsed(),
              sessionId,
            });
            
            controller.close();
          } catch (error_) {
            console.error('Stream error:', error_);
            
            // Try to salvage a result if the model forgot nextStep
            const salvaged = trySalvageCoachResult(error_);
            if (salvaged) {
              // Also coerce the salvaged result
              const coerced = coerceResultToCurrentStep(
                salvaged, 
                currentStep, 
                draftFieldValue, 
                locale,
                isFirstAttemptForStep,
                isRewriteRequest
              );
              
              // Validate the salvaged result
              const validationError = validateCoachResult(coerced, currentStep);
              if (!validationError) {
                // Persist assistant message for salvaged result too
                try {
                  // Ensure user sees nextQuestion by appending to assistantText
                  let assistantText = coerced.assistantText as string;
                  const nextQuestion = coerced.nextQuestion as string | undefined;
                  
                  if (nextQuestion && nextQuestion.trim() !== '') {
                    assistantText = `${assistantText}\n\n${nextQuestion.trim()}`;
                    coerced.assistantText = assistantText;
                  }

                  const assistantMessage: Omit<ChatMessage, '_id'> = {
                    sessionId: objectId,
                    role: 'assistant',
                    content: assistantText,
                    createdAt: new Date(),
                    step: currentStep,
                  };
                  const insertResult = await messagesCol.insertOne(assistantMessage as ChatMessage);
                  const assistantMessageId = insertResult.insertedId.toString();
                  const salvagedWithId = { ...coerced, assistantMessageId };
                  const salvagedLine = JSON.stringify(salvagedWithId) + '\n';
                  controller.enqueue(encoder.encode(salvagedLine));
                  
                  // Log successful AI request (salvaged)
                  logAiRequest({
                    uid: auth.userId,
                    feature: AI_FEATURE.COACH_CHAT,
                    provider: providerName,
                    model: modelId,
                    status: AI_REQUEST_STATUS.OK,
                    durationMs: requestTimer.elapsed(),
                    sessionId,
                  });
                } catch {
                  console.error('Failed to persist salvaged assistant message');
                  // Still emit the result without ID
                  const salvagedLine = JSON.stringify(coerced) + '\n';
                  controller.enqueue(encoder.encode(salvagedLine));
                  
                  // Log successful AI request (salvaged, no persistence)
                  logAiRequest({
                    uid: auth.userId,
                    feature: AI_FEATURE.COACH_CHAT,
                    provider: providerName,
                    model: modelId,
                    status: AI_REQUEST_STATUS.OK,
                    durationMs: requestTimer.elapsed(),
                    sessionId,
                  });
                }
                controller.close();
                return;
              }
            }
            
            // Log error AI request
            logAiRequest({
              uid: auth.userId,
              feature: AI_FEATURE.COACH_CHAT,
              provider: providerName,
              model: modelId,
              status: AI_REQUEST_STATUS.ERROR,
              durationMs: requestTimer.elapsed(),
              sessionId,
            });
            
            // Emit error as NDJSON line for client to handle
            const errorLine = JSON.stringify({ error: 'coach_stream_failed' }) + '\n';
            controller.enqueue(encoder.encode(errorLine));
            controller.close();
          }
        },
      });

      // Return NDJSON streaming response
      return new Response(stream, {
        headers: {
          'Content-Type': 'application/x-ndjson; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          ...createRateLimitHeaders(rateLimitResult),
          'X-Coach-Quota-Limit': String(quotaResult.limit ?? 'unlimited'),
          'X-Coach-Quota-Remaining': String(quotaResult.remaining ?? 'unlimited'),
          'X-Coach-Quota-Used': String(quotaResult.used),
          'X-Coach-Quota-Reset': quotaResult.resetAt.toISOString(),
        },
      });
    } catch (error) {
      console.error('Coach API error:', error);
      return createErrorResponse('Failed to process message', 500);
    }
  })(request, { params: Promise.resolve({}) });
}
