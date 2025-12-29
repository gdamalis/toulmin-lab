import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { streamObject } from 'ai';
import { withAuth } from '@/lib/api/auth';
import { createErrorResponse } from '@/lib/api/responses';
import { parseRequestBody } from '@/lib/api/middleware';
import { checkRateLimit, COACH_RATE_LIMIT, createRateLimitHeaders } from '@/lib/api/rateLimit';
import { validateChatRequest, CoachAIResultSchema } from '@/lib/validation/coach';
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
  getNextStep,
  TOULMIN_STEPS,
} from '@/types/coach';
import { getLocale, getTranslations } from 'next-intl/server';

/**
 * Sanitize user input to prevent prompt injection
 */
function sanitizeUserInput(input: string): string {
  // Remove any attempts to override system instructions
  const patterns = [
    /ignore (previous|all|above) instructions/gi,
    /you are now/gi,
    /new instructions:/gi,
    /system:/gi,
    /\[SYSTEM\]/gi,
    /\[INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
  ];
  
  let sanitized = input;
  patterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '[FILTERED]');
  });
  
  // Limit length
  return sanitized.substring(0, 5000);
}

/**
 * Try to salvage a coach result when the model forgets nextStep
 * This patches the result so it passes schema validation
 */
function trySalvageCoachResult(err: unknown): Record<string, unknown> | null {
  if (!err || typeof err !== 'object') return null;

  // Vercel AI SDK errors sometimes include the generated text payload
  const text = (err as { text?: unknown }).text;
  if (typeof text !== 'string') return null;

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const shouldAdvance = parsed.shouldAdvance === true;
    const nextStep = parsed.nextStep;

    if (shouldAdvance && (nextStep === undefined || nextStep === null)) {
      const step = parsed.step as ToulminStep | undefined;
      if (!step) return parsed;

      // Don't advance from rebuttal; completion should be signaled via isComplete=true
      if (step === TOULMIN_STEPS.REBUTTAL) {
        parsed.shouldAdvance = false;
        return parsed;
      }

      const computed = getNextStep(step);
      if (computed) parsed.nextStep = computed;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * POST /api/coach
 * Stream AI coach response
 */
export async function POST(request: NextRequest) {
  return withAuth(async (request, _context, auth) => {
    // Rate limiting
    const rateLimitResult = checkRateLimit(auth.userId, COACH_RATE_LIMIT);
    
    if (!rateLimitResult.allowed) {
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
          },
        }
      );
    }

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

      // Build conversation history, filtering out invalid messages
      const conversationHistory = recentMessages
        .reverse()
        .filter((msg) => 
          typeof msg.content === 'string' && 
          msg.content.trim() !== '' &&
          (msg.role === 'user' || msg.role === 'assistant')
        )
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Sanitize user input
      const sanitizedMessage = sanitizeUserInput(message);

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

      // Get AI provider and system prompt
      const provider = getCoachProvider();
      const model = provider.getModel();
      const systemPrompt = getCoachSystemPrompt(currentStep, draft as ArgumentDraft, locale, stepInfo);

      // Build messages for AI
      const messages = [
        ...conversationHistory,
        { role: 'user' as const, content: sanitizedMessage },
      ];

      // Stream the response using streamObject
      const result = streamObject({
        model,
        schema: CoachAIResultSchema,
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
            
            // Emit final complete object
            const finalObject = await result.object;
            const finalLine = JSON.stringify(finalObject) + '\n';
            controller.enqueue(encoder.encode(finalLine));
            
            controller.close();
          } catch (streamErr) {
            console.error('Stream error:', streamErr);
            
            // Try to salvage a result if the model forgot nextStep
            const salvaged = trySalvageCoachResult(streamErr);
            if (salvaged) {
              const parsed = CoachAIResultSchema.safeParse(salvaged);
              if (parsed.success) {
                const salvagedLine = JSON.stringify(parsed.data) + '\n';
                controller.enqueue(encoder.encode(salvagedLine));
                controller.close();
                return;
              }
            }
            
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
        },
      });
    } catch (error) {
      console.error('Coach API error:', error);
      return createErrorResponse('Failed to process message', 500);
    }
  })(request, { params: Promise.resolve({}) });
}
