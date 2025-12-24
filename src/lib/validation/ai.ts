import { z } from 'zod';
import { AIProvider } from '@/types/ai';

/**
 * AI argument generation request validation schema
 */
export const aiArgumentRequestSchema = z.object({
  prompt: z.string()
    .min(10, 'Prompt must be at least 10 characters long')
    .max(2000, 'Prompt cannot exceed 2000 characters')
    .refine(
      (val) => val.trim().length > 0,
      'Prompt cannot be empty or only whitespace'
    ),
  context: z.string().optional(),
  language: z.enum(['en', 'es']).optional().default('en'),
  userId: z.string().optional()
});

/**
 * AI provider validation schema
 */
export const aiProviderSchema = z.enum(['gemini', 'openai', 'claude'] as const);

/**
 * AI generation options schema
 */
export const aiGenerationOptionsSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(8192).optional(),
  timeout: z.number().min(1000).max(60000).optional(),
  retryOnFailure: z.boolean().optional().default(true)
});

/**
 * Multiple variations request schema
 */
export const aiVariationsRequestSchema = z.object({
  prompt: z.string()
    .min(10, 'Prompt must be at least 10 characters long')
    .max(2000, 'Prompt cannot exceed 2000 characters'),
  count: z.number().min(1).max(5).default(3),
  provider: aiProviderSchema.optional().default('gemini'),
  context: z.string().optional(),
  language: z.enum(['en', 'es']).optional().default('en'),
  userId: z.string().optional()
});

/**
 * Prompt validation schema (for sanitization)
 */
export const promptValidationSchema = z.string()
  .transform((val) => {
    // Sanitize the input
    return val
      .trim()
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 2000); // Limit length
  })
  .refine(
    (val) => val.length >= 10,
    'Prompt must be at least 10 characters after sanitization'
  );

/**
 * Type definitions from schemas
 */
export type AIArgumentRequest = z.infer<typeof aiArgumentRequestSchema>;
export type AIProviderType = z.infer<typeof aiProviderSchema>;
export type AIGenerationOptions = z.infer<typeof aiGenerationOptionsSchema>;
export type AIVariationsRequest = z.infer<typeof aiVariationsRequestSchema>;

/**
 * Validation functions
 */
export const validateAIArgumentRequest = (data: unknown) => {
  try {
    return {
      success: true,
      data: aiArgumentRequestSchema.parse(data)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Invalid request format'
    };
  }
};

export const validateAIVariationsRequest = (data: unknown) => {
  try {
    return {
      success: true,
      data: aiVariationsRequestSchema.parse(data)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Invalid request format'
    };
  }
};

export const validatePrompt = (prompt: string) => {
  try {
    return {
      success: true,
      data: promptValidationSchema.parse(prompt)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof z.ZodError ? error.errors[0]?.message : 'Invalid prompt'
    };
  }
};

export const validateProvider = (provider: unknown): provider is AIProvider => {
  try {
    aiProviderSchema.parse(provider);
    return true;
  } catch {
    return false;
  }
};

/**
 * Rate limit validation helpers
 */
export const validateRateLimit = (remaining: number, resetTime: number) => {
  const now = Date.now();
  
  if (remaining <= 0 && resetTime > now) {
    const retryAfter = Math.ceil((resetTime - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`
    };
  }
  
  return {
    allowed: true,
    remaining,
    resetTime
  };
};

/**
 * Token count validation
 */
export const validateTokenCount = (text: string, maxTokens: number = 1000) => {
  const estimatedTokens = Math.ceil(text.length / 4);
  
  if (estimatedTokens > maxTokens) {
    return {
      valid: false,
      estimatedTokens,
      maxTokens,
      message: `Text is too long (${estimatedTokens} tokens). Maximum allowed: ${maxTokens} tokens.`
    };
  }
  
  return {
    valid: true,
    estimatedTokens,
    maxTokens
  };
}; 