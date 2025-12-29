import { streamObject } from 'ai';
import { getCoachProvider } from './providers';
import { getCoachSystemPrompt } from './prompts/coachSystemPrompt';
import { CoachAIResultSchema } from '@/lib/validation/coach';
import { ToulminStep, ArgumentDraft } from '@/types/coach';

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
