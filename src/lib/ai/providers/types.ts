import { LanguageModel } from 'ai';

/**
 * Supported AI providers for the coach feature
 */
export const AI_PROVIDERS = {
  GEMINI: 'gemini',
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
} as const;

export type AIProvider = typeof AI_PROVIDERS[keyof typeof AI_PROVIDERS];

/**
 * Configuration for an AI provider
 */
export interface AIProviderConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
}

/**
 * Interface for AI provider implementations
 * Each provider must return a Vercel AI SDK LanguageModel
 */
export interface CoachModelProvider {
  /**
   * Get the language model instance for the coach feature
   */
  getModel(): LanguageModel;
  
  /**
   * Get the provider name for logging/debugging
   */
  getProviderName(): string;
  
  /**
   * Get the model ID for logging/analytics
   */
  getModelId(): string;
}
