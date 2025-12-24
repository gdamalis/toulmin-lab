import { Locale } from '@/i18n/settings';
import { ToulminArgument } from './client';

/**
 * AI Provider types for pluggable architecture
 */
export type AIProvider = 'gemini' | 'openai' | 'claude';

export interface AIProviderConfig {
  name: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  retryDelay: number;
  maxRetries: number;
}

/**
 * AI Provider interface for pluggable implementations
 */
export interface AIProviderInterface {
  name: AIProvider;
  config: AIProviderConfig;
  rateLimit: RateLimitConfig;
  
  generateArgument(prompt: string, language?: Locale): Promise<AIArgumentResult>;
  validateConnection(): Promise<boolean>;
  getRateLimitInfo(): {
    remaining: number;
    resetTime: number;
  };
}

/**
 * Free-text argument generation request
 */
export interface AIArgumentRequest {
  prompt: string;
  context?: string;
  language?: Locale;
  userId?: string;
}

/**
 * AI argument generation result
 */
export interface AIArgumentResult {
  success: boolean;
  argument?: ToulminArgument;
  error?: string;
  confidence?: number;
  reasoning?: string;
  suggestions?: string[];
}

/**
 * AI argument generation response (API response)
 */
export interface AIArgumentResponse {
  success: boolean;
  data?: {
    argument: ToulminArgument;
    confidence: number;
    reasoning: string;
    suggestions: string[];
  };
  error?: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  };
}

/**
 * Rate limiting state
 */
export interface RateLimitState {
  requests: number;
  windowStart: number;
  isBlocked: boolean;
  nextResetTime: number;
}

/**
 * AI service error types
 */
export type AIError = 
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_PROMPT'
  | 'PROVIDER_ERROR'
  | 'NETWORK_ERROR'
  | 'CONFIGURATION_ERROR';

export interface AIServiceError {
  type: AIError;
  message: string;
  retryable: boolean;
  retryAfter?: number;
}

/**
 * AI generation options
 */
export interface AIGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retryOnFailure?: boolean;
} 