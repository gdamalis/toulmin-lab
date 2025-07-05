import { 
  AIProviderInterface, 
  AIProvider, 
  AIProviderConfig, 
  RateLimitConfig, 
  RateLimitState, 
  AIServiceError 
} from '@/types/ai';

/**
 * Rate limiting utility functions
 */
export const createRateLimiter = (config: RateLimitConfig) => {
  const state: RateLimitState = {
    requests: 0,
    windowStart: Date.now(),
    isBlocked: false,
    nextResetTime: Date.now() + 60000, // 1 minute window
  };

  const checkRateLimit = (): { allowed: boolean; retryAfter?: number } => {
    const now = Date.now();
    const windowDuration = 60000; // 1 minute in milliseconds
    
    // Reset window if expired
    if (now - state.windowStart >= windowDuration) {
      state.requests = 0;
      state.windowStart = now;
      state.isBlocked = false;
      state.nextResetTime = now + windowDuration;
    }

    // Check if we've exceeded the limit
    if (state.requests >= config.requestsPerMinute) {
      state.isBlocked = true;
      const retryAfter = Math.ceil((state.nextResetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  };

  const recordRequest = (): void => {
    state.requests++;
  };

  const getRemainingRequests = (): number => {
    const now = Date.now();
    if (now - state.windowStart >= 60000) {
      return config.requestsPerMinute;
    }
    return Math.max(0, config.requestsPerMinute - state.requests);
  };

  const getResetTime = (): number => {
    return state.nextResetTime;
  };

  return {
    checkRateLimit,
    recordRequest,
    getRemainingRequests,
    getResetTime,
    state: () => ({ ...state })
  };
};

/**
 * Abstract base class for AI providers
 */
export const createBaseProvider = (
  config: AIProviderConfig, 
  rateLimit: RateLimitConfig
) => {
  const rateLimiter = createRateLimiter(rateLimit);

  const validateConfig = (): boolean => {
    if (!config.apiKey) {
      throw new Error(`API key is required for ${config.name} provider`);
    }
    return true;
  };

  const handleRateLimit = async (): Promise<void> => {
    const { allowed, retryAfter } = rateLimiter.checkRateLimit();
    
    if (!allowed) {
      const error: AIServiceError = {
        type: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded for ${config.name}. Try again in ${retryAfter} seconds.`,
        retryable: true,
        retryAfter
      };
      throw error;
    }
    
    rateLimiter.recordRequest();
  };

  const withRetry = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = rateLimit.maxRetries
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on non-retryable errors
        if (error instanceof Error && 'retryable' in error && !error.retryable) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry
        const delay = rateLimit.retryDelay * Math.pow(2, attempt); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  };

  return {
    config,
    rateLimit,
    rateLimiter,
    validateConfig,
    handleRateLimit,
    withRetry
  };
};

/**
 * Default rate limit configurations for different providers
 */
export const DEFAULT_RATE_LIMITS: Record<AIProvider, RateLimitConfig> = {
  gemini: {
    requestsPerMinute: 15, // Conservative for free tier
    requestsPerHour: 1000,
    retryDelay: 1000,
    maxRetries: 3
  },
  openai: {
    requestsPerMinute: 20,
    requestsPerHour: 3000,
    retryDelay: 1000,
    maxRetries: 3
  },
  claude: {
    requestsPerMinute: 10,
    requestsPerHour: 1000,
    retryDelay: 1000,
    maxRetries: 3
  }
};

/**
 * Provider registry for managing multiple AI providers
 */
export const createProviderRegistry = () => {
  const providers = new Map<AIProvider, AIProviderInterface>();

  const register = (provider: AIProviderInterface): void => {
    providers.set(provider.name, provider);
  };

  const get = (name: AIProvider): AIProviderInterface | undefined => {
    return providers.get(name);
  };

  const getDefault = (): AIProviderInterface => {
    const defaultProvider = providers.get('gemini');
    if (!defaultProvider) {
      throw new Error('Default provider (Gemini) not found');
    }
    return defaultProvider;
  };

  const list = (): AIProvider[] => {
    return Array.from(providers.keys());
  };

  const has = (name: AIProvider): boolean => {
    return providers.has(name);
  };

  return {
    register,
    get,
    getDefault,
    list,
    has
  };
}; 