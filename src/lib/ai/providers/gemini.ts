import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { LanguageModel } from 'ai';
import { CoachModelProvider, AI_PROVIDERS } from './types';

/**
 * Default Gemini model for coach feature
 * Using Gemini 2.0 Flash for fast, cost-effective responses
 */
const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';

/**
 * Allowlist of permitted Gemini models for production
 * Only flash-class models are allowed to control costs
 */
const ALLOWED_GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
] as const;

/**
 * Validate and sanitize model ID to prevent expensive model usage
 * Falls back to default if model is not in allowlist
 */
function validateModelId(modelId: string | undefined): string {
  if (!modelId) {
    return DEFAULT_GEMINI_MODEL;
  }
  
  // Check if model is in allowlist
  if (ALLOWED_GEMINI_MODELS.includes(modelId as typeof ALLOWED_GEMINI_MODELS[number])) {
    return modelId;
  }
  
  // Log warning for production awareness
  console.warn(
    `Model "${modelId}" is not in allowlist. Falling back to ${DEFAULT_GEMINI_MODEL}. ` +
    `Allowed models: ${ALLOWED_GEMINI_MODELS.join(', ')}`
  );
  
  return DEFAULT_GEMINI_MODEL;
}

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
  const resolvedModelId = validateModelId(modelId);

  return {
    getModel: () => getGeminiModel(resolvedModelId),
    getProviderName: getGeminiProviderName,
  };
}
