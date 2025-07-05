import { 
  AIArgumentRequest, 
  AIArgumentResult, 
  AIServiceError, 
  AIProvider 
} from '@/types/ai';
import { ApiResponse } from '@/lib/api/responses';
import { createProviderRegistry } from '@/lib/ai/provider-interface';
import { createDefaultGeminiProvider } from '@/lib/ai/providers/gemini';

/**
 * Global provider registry
 */
const providerRegistry = createProviderRegistry();

/**
 * Initialize AI providers
 */
export const initializeAIProviders = (): void => {
  try {
    // Register Gemini provider
    const geminiProvider = createDefaultGeminiProvider();
    providerRegistry.register(geminiProvider);
    
    console.log('AI providers initialized successfully');
  } catch (error) {
    console.error('Failed to initialize AI providers:', error);
    throw error;
  }
};

/**
 * Get available AI providers
 */
export const getAvailableProviders = (): AIProvider[] => {
  return providerRegistry.list();
};

/**
 * Check if a provider is available
 */
export const isProviderAvailable = (provider: AIProvider): boolean => {
  return providerRegistry.has(provider);
};

/**
 * Validate AI provider connection
 */
export const validateAIProvider = async (
  provider: AIProvider = 'gemini'
): Promise<ApiResponse<{ connected: boolean }>> => {
  try {
    const aiProvider = providerRegistry.get(provider);
    
    if (!aiProvider) {
      return {
        success: false,
        error: `Provider ${provider} is not available`
      };
    }

    const isConnected = await aiProvider.validateConnection();
    
    return {
      success: true,
      data: { connected: isConnected }
    };
  } catch (error) {
    console.error(`Error validating ${provider} provider:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
};

/**
 * Generate a Toulmin argument from free text
 */
export const generateArgumentFromText = async (
  request: AIArgumentRequest,
  provider: AIProvider = 'gemini'
): Promise<ApiResponse<AIArgumentResult>> => {
  try {
    // Validate input
    if (!request.prompt?.trim()) {
      return {
        success: false,
        error: 'Prompt is required for argument generation'
      };
    }

    // Get the AI provider
    const aiProvider = providerRegistry.get(provider);
    
    if (!aiProvider) {
      return {
        success: false,
        error: `Provider ${provider} is not available`
      };
    }

    // Generate the argument
    const result = await aiProvider.generateArgument(request.prompt, request.language);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error ?? 'Failed to generate argument'
      };
    }

    // Enhance the argument with user information if provided
    if (result.argument && request.userId) {
      result.argument.author.userId = request.userId;
    }

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('Error generating argument:', error);
    
    // Handle AI-specific errors
    if (error && typeof error === 'object' && 'type' in error) {
      const aiError = error as AIServiceError;
      return {
        success: false,
        error: aiError.message
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during generation'
    };
  }
};

/**
 * Generate multiple argument variations
 */
export const generateArgumentVariations = async (
  request: AIArgumentRequest,
  count: number = 3,
  provider: AIProvider = 'gemini'
): Promise<ApiResponse<AIArgumentResult[]>> => {
  try {
    if (count > 5) {
      return {
        success: false,
        error: 'Maximum of 5 variations allowed'
      };
    }

    const results: AIArgumentResult[] = [];
    const errors: string[] = [];

    // Generate variations sequentially to respect rate limits
    for (let i = 0; i < count; i++) {
      const result = await generateArgumentFromText(request, provider);
      
      if (result.success && result.data) {
        results.push(result.data);
      } else {
        errors.push(result.error ?? `Failed to generate variation ${i + 1}`);
      }
    }

    if (results.length === 0) {
      return {
        success: false,
        error: `Failed to generate any variations: ${errors.join(', ')}`
      };
    }

    return {
      success: true,
      data: results
    };

  } catch (error) {
    console.error('Error generating argument variations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get AI provider rate limit information
 */
export const getProviderRateLimit = (provider: AIProvider = 'gemini') => {
  const aiProvider = providerRegistry.get(provider);
  
  if (!aiProvider) {
    return null;
  }

  const rateLimitInfo = aiProvider.getRateLimitInfo();

  return {
    provider: provider,
    config: aiProvider.rateLimit,
    remaining: rateLimitInfo.remaining,
    resetTime: rateLimitInfo.resetTime
  };
};

/**
 * Sanitize and validate prompt input
 */
export const sanitizePrompt = (prompt: string): string => {
  // Remove potentially harmful content
  const sanitized = prompt
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 2000); // Limit length

  return sanitized;
};

/**
 * Estimate token count for a prompt (rough estimation)
 */
export const estimateTokenCount = (text: string): number => {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
};

/**
 * Check if prompt exceeds recommended length
 */
export const validatePromptLength = (prompt: string): { 
  valid: boolean; 
  estimatedTokens: number; 
  warning?: string; 
} => {
  const estimatedTokens = estimateTokenCount(prompt);
  const maxRecommendedTokens = 1000; // Conservative limit
  
  if (estimatedTokens > maxRecommendedTokens) {
    return {
      valid: false,
      estimatedTokens,
      warning: `Prompt is too long (${estimatedTokens} tokens). Consider shortening it to under ${maxRecommendedTokens} tokens.`
    };
  }

  return {
    valid: true,
    estimatedTokens
  };
};

// Initialize providers when module is imported
try {
  initializeAIProviders();
} catch (error) {
  console.warn('AI providers not initialized during import:', error);
} 