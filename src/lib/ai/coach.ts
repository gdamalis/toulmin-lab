import { streamObject, generateObject } from 'ai';
import { z } from 'zod';
import { getCoachProvider } from './providers';
import { getCoachSystemPrompt, SupportedLocale } from './prompts/coachSystemPrompt';
import { CoachAIResultSchema } from '@/lib/validation/coach';
import { ToulminStep, ArgumentDraft } from '@/types/coach';
import { 
  logAiRequest, 
  createRequestTimer, 
  AI_REQUEST_STATUS, 
  AI_FEATURE 
} from '@/lib/services/ai-usage';

/**
 * Context passed to the AI for generating responses
 */
export interface CoachContext {
  sessionId: string;
  userMessage: string;
  currentStep: ToulminStep;
  draft: ArgumentDraft;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/**
 * Stream a coach response from the AI
 * 
 * Uses Vercel AI SDK's streamObject for type-safe structured output
 * with real-time streaming capabilities.
 * 
 * @param context - The current coaching context
 * @returns AsyncIterable stream of partial results
 */
export async function streamCoachResponse(context: CoachContext) {
  const provider = getCoachProvider();
  const model = provider.getModel();
  const systemPrompt = getCoachSystemPrompt(context.currentStep, context.draft);

  // Build conversation messages
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...context.conversationHistory.slice(-10), // Keep last 10 messages for context
    { role: 'user', content: context.userMessage },
  ];

  const result = streamObject({
    model,
    schema: CoachAIResultSchema,
    system: systemPrompt,
    messages,
    temperature: 0.7,
  });

  return result;
}

/**
 * Generate a single coach response (non-streaming)
 * Useful for testing and simpler use cases
 */
export async function generateCoachResponse(context: CoachContext) {
  const provider = getCoachProvider();
  const model = provider.getModel();
  const systemPrompt = getCoachSystemPrompt(context.currentStep, context.draft);

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...context.conversationHistory.slice(-10),
    { role: 'user', content: context.userMessage },
  ];

  const { object } = await streamObject({
    model,
    schema: CoachAIResultSchema,
    system: systemPrompt,
    messages,
    temperature: 0.7,
  });

  return object;
}

/**
 * Schema for title generation response
 */
const TitleGenerationSchema = z.object({
  title: z.string().min(1).max(100).describe('A concise, descriptive title for the argument'),
});

/**
 * Language prompts for title generation
 */
const TITLE_PROMPTS: Record<SupportedLocale, { system: string; user: (claim: string) => string }> = {
  en: {
    system: `You are a title generator for academic arguments. Generate a concise, descriptive title (5-10 words) that captures the essence of the argument's claim. The title should be clear, professional, and suitable for an academic context. Do not use quotes or special formatting.`,
    user: (claim: string) => `Generate a title for an argument with this claim: "${claim}"`,
  },
  es: {
    system: `Eres un generador de títulos para argumentos académicos. Genera un título conciso y descriptivo (5-10 palabras) que capture la esencia de la afirmación del argumento. El título debe ser claro, profesional y adecuado para un contexto académico. No uses comillas ni formato especial.`,
    user: (claim: string) => `Genera un título para un argumento con esta afirmación: "${claim}"`,
  },
};

/**
 * Generate a title for an argument based on its claim
 * 
 * Uses generateObject (non-streaming) for more reliable server-side generation.
 * 
 * @param claim - The claim text to generate a title from
 * @param locale - The user's locale for response language (default: 'en')
 * @param userId - Optional user ID for analytics tracking
 * @returns The generated title string
 */
export async function generateArgumentTitle(
  claim: string,
  locale: SupportedLocale = 'en',
  userId?: string
): Promise<string> {
  const provider = getCoachProvider();
  const model = provider.getModel();
  const providerName = provider.getProviderName();
  const modelId = provider.getModelId();
  const prompts = TITLE_PROMPTS[locale];
  const timer = createRequestTimer();

  try {
    const { object } = await generateObject({
      model,
      schema: TitleGenerationSchema,
      system: prompts.system,
      messages: [{ role: 'user', content: prompts.user(claim) }],
      temperature: 0.5,
    });

    // Log successful AI request
    logAiRequest({
      uid: userId ?? null,
      feature: AI_FEATURE.COACH_TITLE,
      provider: providerName,
      model: modelId,
      status: AI_REQUEST_STATUS.OK,
      durationMs: timer.elapsed(),
    });

    return object.title;
  } catch (error) {
    // Log failed AI request
    logAiRequest({
      uid: userId ?? null,
      feature: AI_FEATURE.COACH_TITLE,
      provider: providerName,
      model: modelId,
      status: AI_REQUEST_STATUS.ERROR,
      durationMs: timer.elapsed(),
    });

    throw error;
  }
}
