import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { LanguageModel } from 'ai';
import { CoachModelProvider, AI_PROVIDERS } from './types';

/**
 * Default Gemini model for coach feature
 * Using Gemini 2.0 Flash for fast, cost-effective responses
 */
const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';

/**
 * Get the API key from environment variables
 * Supports both GEMINI_API_KEY and GOOGLE_GENERATIVE_AI_API_KEY
 */
function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'Google Generative AI API key is missing. ' +
      'Set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY environment variable.'
    );
  }
  
  return apiKey;
}

/**
 * Get the Gemini language model instance
 */
function getGeminiModel(modelId: string): LanguageModel {
  const google = createGoogleGenerativeAI({
    apiKey: getApiKey(),
  });
  
  return google(modelId);
}

/**
 * Get the Gemini provider name for logging/debugging
 */
function getGeminiProviderName(): string {
  return AI_PROVIDERS.GEMINI;
}

/**
 * Create a Gemini provider instance (functional factory)
 */
export function createGeminiProvider(modelId?: string): CoachModelProvider {
  const resolvedModelId = modelId ?? DEFAULT_GEMINI_MODEL;

  return {
    getModel: () => getGeminiModel(resolvedModelId),
    getProviderName: getGeminiProviderName,
  };
}
