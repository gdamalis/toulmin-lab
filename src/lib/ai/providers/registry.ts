import { CoachModelProvider, AI_PROVIDERS, AIProvider } from './types';
import { createGeminiProvider } from './gemini';

/**
 * Environment variable for selecting AI provider
 */
const AI_PROVIDER_ENV = process.env.AI_PROVIDER ?? AI_PROVIDERS.GEMINI;
const AI_MODEL_ENV = process.env.AI_MODEL;

/**
 * Registry of available AI providers
 */
const providerFactories: Record<AIProvider, (modelId?: string) => CoachModelProvider> = {
  [AI_PROVIDERS.GEMINI]: createGeminiProvider,
  // Future providers can be added here:
  // [AI_PROVIDERS.OPENAI]: createOpenAIProvider,
  // [AI_PROVIDERS.ANTHROPIC]: createAnthropicProvider,
  [AI_PROVIDERS.OPENAI]: () => {
    throw new Error('OpenAI provider not yet implemented');
  },
  [AI_PROVIDERS.ANTHROPIC]: () => {
    throw new Error('Anthropic provider not yet implemented');
  },
};

/**
 * Get the configured AI provider based on environment variables
 * 
 * Environment variables:
 * - AI_PROVIDER: 'gemini' | 'openai' | 'anthropic' (default: 'gemini')
 * - AI_MODEL: Optional model override (e.g., 'gemini-2.0-flash-exp')
 * 
 * @returns CoachModelProvider instance
 */
export function getCoachProvider(): CoachModelProvider {
  const providerKey = AI_PROVIDER_ENV as AIProvider;
  
  const factory = providerFactories[providerKey];
  
  if (!factory) {
    console.warn(
      `Unknown AI provider "${providerKey}", falling back to Gemini`
    );
    return createGeminiProvider(AI_MODEL_ENV);
  }
  
  return factory(AI_MODEL_ENV);
}

/**
 * Get the current provider name for logging
 */
export function getCurrentProviderName(): string {
  return AI_PROVIDER_ENV;
}
