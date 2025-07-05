import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  AIProviderInterface, 
  AIProviderConfig, 
  AIArgumentResult, 
  AIServiceError 
} from '@/types/ai';
import { ToulminArgument } from '@/types/client';
import { createBaseProvider, DEFAULT_RATE_LIMITS } from '../provider-interface';
import { Locale } from '@/i18n/settings';

/**
 * Gemini-specific configuration
 */
export interface GeminiConfig extends AIProviderConfig {
  model: 'gemini-2.0-flash' | 'gemini-1.5-flash' | 'gemini-1.5-pro';
  safetySettings?: {
    category: string;
    threshold: string;
  }[];
}

/**
 * Prompt template for Toulmin argument generation
 */
const TOULMIN_PROMPT_TEMPLATE = `
You are an expert in argumentation and the Toulmin model. Your task is to analyze a user's free-text description and create a structured Toulmin argument.

The Toulmin model has these components:
1. **Claim**: The main assertion or conclusion being argued
2. **Grounds**: The evidence or facts supporting the claim
3. **Warrant**: The logical connection between grounds and claim
4. **Backing**: Support for the warrant (why the warrant is valid)
5. **Qualifier**: Words that limit the claim (usually, probably, etc.)
6. **Rebuttal**: Conditions under which the claim might not hold

User's description: "{prompt}" 
Provide the argument in language: {language}

Please analyze this and create a structured Toulmin argument. Return your response as a JSON object with this exact structure:

{
  "name": "Brief title for the argument",
  "author": {
    "_id": "",
    "name": "",
    "userId": ""
  },
  "parts": {
    "claim": "The main assertion",
    "grounds": "The evidence supporting the claim",
    "groundsBacking": "Why this evidence is credible",
    "warrant": "How the evidence connects to the claim",
    "warrantBacking": "Why this logical connection is valid",
    "qualifier": "Limiting words (e.g., 'In most cases', 'Usually', 'Probably')",
    "rebuttal": "Conditions where the claim might not hold"
  },
  "createdAt": "{currentDate}",
  "updatedAt": "{currentDate}"
}

Additional context:
- Make each component specific and meaningful
- Ensure the warrant clearly explains the logical connection
- Include appropriate qualifiers to make the argument more nuanced
- Consider potential counterarguments in the rebuttal
- Keep language clear and concise
- Return ONLY the JSON object, no additional text
`;

/**
 * Creates a Gemini provider instance
 */
export const createGeminiProvider = (apiKey: string): AIProviderInterface => {
  const config: GeminiConfig = {
    name: 'gemini',
    apiKey,
    model: 'gemini-2.0-flash',
    maxTokens: 4096,
    temperature: 0.7,
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ]
  };

  const rateLimit = DEFAULT_RATE_LIMITS.gemini;
  const baseProvider = createBaseProvider(config, rateLimit);
  
  // Initialize Google AI
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: config.model });

  const generateArgument = async (prompt: string, language?: Locale): Promise<AIArgumentResult> => {
    try {
      // Validate configuration
      baseProvider.validateConfig();
      
      // Handle rate limiting
      await baseProvider.handleRateLimit();

      // Prepare the prompt
      const currentDate = new Date().toISOString();
      const fullPrompt = TOULMIN_PROMPT_TEMPLATE
        .replace('{prompt}', prompt)
        .replace('{language}', language ?? 'en')
        .replace(/{currentDate}/g, currentDate);

      // Generate with retry logic
      const result = await baseProvider.withRetry(async () => {
        const response = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: {
            maxOutputTokens: config.maxTokens,
            temperature: config.temperature,
          },
        });

        return response;
      });

      // Extract and parse the response
      const text = result.response.text();
      
      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      // Parse JSON response
      let parsedArgument: ToulminArgument;
      try {
        // Clean the response (remove markdown formatting if present)
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        parsedArgument = JSON.parse(cleanedText);
      } catch (parseError) {
        throw new Error(`Failed to parse Gemini response: ${parseError}`);
      }

      // Validate the parsed argument structure
      if (!parsedArgument.parts || !parsedArgument.parts.claim) {
        throw new Error('Invalid argument structure from Gemini');
      }

      return {
        success: true,
        argument: parsedArgument,
        confidence: 0.8, // Default confidence for Gemini
        reasoning: 'Generated using Gemini 2.0 Flash model',
        suggestions: [
          'Review the warrant to ensure it clearly connects evidence to claim',
          'Consider strengthening the backing with additional sources',
          'Evaluate if the qualifier appropriately limits the claim'
        ]
      };

    } catch (error) {
      console.error('Gemini generation error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('rate limit') || error.message.includes('quota')) {
          const aiError: AIServiceError = {
            type: 'RATE_LIMIT_EXCEEDED',
            message: 'Gemini rate limit exceeded. Please try again in a moment.',
            retryable: true,
            retryAfter: 60
          };
          throw aiError;
        }
        
        if (error.message.includes('network') || error.message.includes('connection')) {
          const aiError: AIServiceError = {
            type: 'NETWORK_ERROR',
            message: 'Network error connecting to Gemini. Please check your connection.',
            retryable: true
          };
          throw aiError;
        }
      }

      // Generic provider error
      const aiError: AIServiceError = {
        type: 'PROVIDER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error from Gemini',
        retryable: false
      };
      throw aiError;
    }
  };

  const validateConnection = async (): Promise<boolean> => {
    try {
      await baseProvider.handleRateLimit();
      
      // Simple test request
      const testResponse = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0.1,
        },
      });

      return !!testResponse.response.text();
    } catch (error) {
      console.error('Gemini connection validation failed:', error);
      return false;
    }
  };

  const getRateLimitInfo = () => {
    return {
      remaining: baseProvider.rateLimiter.getRemainingRequests(),
      resetTime: baseProvider.rateLimiter.getResetTime()
    };
  };

  return {
    name: 'gemini',
    config,
    rateLimit,
    generateArgument,
    validateConnection,
    getRateLimitInfo
  };
};

/**
 * Default Gemini provider instance
 */
export const createDefaultGeminiProvider = (): AIProviderInterface => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  return createGeminiProvider(apiKey);
}; 