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

      // Don't advance from rebuttal; set isComplete=true instead
      if (step === TOULMIN_STEPS.REBUTTAL) {
        parsed.shouldAdvance = false;
        parsed.isComplete = true;
        delete parsed.nextStep;
        return parsed;
      }

      const computed = getNextStep(step);
      if (computed) parsed.nextStep = computed;
    }

    // Also handle case where shouldAdvance is true and step is rebuttal (even with nextStep set)
    if (parsed.shouldAdvance === true && parsed.step === TOULMIN_STEPS.REBUTTAL) {
      parsed.shouldAdvance = false;
      parsed.isComplete = true;
      delete parsed.nextStep;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Coerce the AI result to match the session's current step
 * This prevents the model from proposing updates to wrong fields or skipping steps
 * @param draftFieldValue - The current value of the draft field for this step (empty string if not set)
 */
function coerceResultToCurrentStep(
  result: Record<string, unknown>,
  sessionCurrentStep: ToulminStep,
  draftFieldValue: string = ''
): Record<string, unknown> {
  const coerced = { ...result };

  // Force step to match session's current step
  if (coerced.step !== sessionCurrentStep) {
    console.warn(`Coercing AI step '${coerced.step}' to session step '${sessionCurrentStep}'`);
    coerced.step = sessionCurrentStep;
  }

  // If proposedUpdate.field doesn't match current step, remove it
  const proposedUpdate = coerced.proposedUpdate as { field?: string } | undefined;
  if (proposedUpdate && proposedUpdate.field !== sessionCurrentStep) {
    console.warn(`Removing proposedUpdate for field '${proposedUpdate.field}' - expected '${sessionCurrentStep}'`);
    delete coerced.proposedUpdate;
  }

  // Recompute nextStep based on session's current step (not model's claimed step)
  if (coerced.shouldAdvance === true) {
    if (sessionCurrentStep === TOULMIN_STEPS.REBUTTAL) {
      // Can't advance from rebuttal - set isComplete instead
      coerced.shouldAdvance = false;
      coerced.isComplete = true;
      delete coerced.nextStep;
    } else {
      // Server-side save-driven enforcement:
      // If shouldAdvance=true but there's no valid proposedUpdate AND the draft field is empty,
      // we strip shouldAdvance to prevent the client from advancing with an empty box.
      const hasValidProposal = coerced.proposedUpdate !== undefined;
      const stepHasContent = draftFieldValue.trim() !== '';

      if (!hasValidProposal && !stepHasContent) {
        console.warn(`Stripping shouldAdvance=true: no proposedUpdate and draft.${sessionCurrentStep} is empty`);
        coerced.shouldAdvance = false;
        delete coerced.nextStep;
      } else {
        const correctNextStep = getNextStep(sessionCurrentStep);
        if (correctNextStep && coerced.nextStep !== correctNextStep) {
          console.warn(`Correcting nextStep from '${coerced.nextStep}' to '${correctNextStep}'`);
          coerced.nextStep = correctNextStep;
        }
      }
    }
  }

  return coerced;
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
            const draftFieldValue = (draft[currentStep] as string) ?? '';
            const coercedFinal = coerceResultToCurrentStep(
              rawFinalObject as unknown as Record<string, unknown>,
              currentStep,
              draftFieldValue
            );
            const finalLine = JSON.stringify(coercedFinal) + '\n';
            controller.enqueue(encoder.encode(finalLine));
            
            controller.close();
          } catch (streamErr) {
            console.error('Stream error:', streamErr);
            
            // Try to salvage a result if the model forgot nextStep
            const salvaged = trySalvageCoachResult(streamErr);
            if (salvaged) {
              // Also coerce the salvaged result
              const draftValue = (draft[currentStep] as string) ?? '';
              const coerced = coerceResultToCurrentStep(salvaged, currentStep, draftValue);
              const parsed = CoachAIResultSchema.safeParse(coerced);
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
