"use client";

import { useState, useCallback } from 'react';
import { ToulminArgument } from '@/types/client';
import { AIArgumentRequest } from '@/types/ai';
import { useNotification } from '@/contexts/NotificationContext';
import { getCurrentUserToken } from '@/lib/auth/utils';
import { Locale } from '@/i18n/settings';

export interface AIGenerationResult {
  argument: ToulminArgument;
  confidence: number;
  reasoning: string;
  suggestions: string[];
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  maxRequestsPerMinute?: number;
}

export interface AIStatus {
  available: boolean;
  provider: string;
  rateLimitInfo?: RateLimitInfo;
}

export function useAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const { addNotification } = useNotification();

  /**
   * Generate a Toulmin argument from free text
   */
  const generateArgument = useCallback(async (
    prompt: string,
    context?: string,
    language: Locale = 'en'
  ): Promise<AIGenerationResult | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const token = await getCurrentUserToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const request: AIArgumentRequest = {
        prompt: prompt.trim(),
        context,
        language
      };

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          addNotification('warning', 'Rate Limit', 'Please wait a moment before generating another argument.');
          setError('Rate limit exceeded. Please try again in a moment.');
          return null;
        }

        throw new Error(data.error || 'Failed to generate argument');
      }

      if (!data.success || !data.data) {
        throw new Error('Invalid response from AI service');
      }

      // Update rate limit info
      if (data.data.rateLimitInfo) {
        setRateLimitInfo(data.data.rateLimitInfo);
      }

      addNotification('success', 'Success', 'Argument generated successfully!');
      
      return {
        argument: data.data.argument,
        confidence: data.data.confidence,
        reasoning: data.data.reasoning,
        suggestions: data.data.suggestions || []
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      addNotification('error', 'Generation Failed', errorMessage);
      console.error('AI generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [addNotification]);

  /**
   * Get AI service status and rate limit information
   */
  const checkStatus = useCallback(async (): Promise<AIStatus | null> => {
    setIsCheckingStatus(true);
    setError(null);

    try {
      const token = await getCurrentUserToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/ai/generate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check AI status');
      }

      if (!data.success || !data.data) {
        throw new Error('Invalid response from AI service');
      }

      const status: AIStatus = {
        available: data.data.available,
        provider: data.data.provider,
        rateLimitInfo: data.data.rateLimitInfo
      };

      // Update local rate limit info
      if (data.data.rateLimitInfo) {
        setRateLimitInfo(data.data.rateLimitInfo);
      }

      return status;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('AI status check error:', err);
      return null;
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  /**
   * Validate prompt before sending to AI
   */
  const validatePrompt = useCallback((prompt: string): { 
    valid: boolean; 
    error?: string; 
    estimatedTokens?: number;
  } => {
    const trimmed = prompt.trim();
    
    if (trimmed.length < 10) {
      return { valid: false, error: 'Prompt must be at least 10 characters long' };
    }
    
    if (trimmed.length > 2000) {
      return { valid: false, error: 'Prompt cannot exceed 2000 characters' };
    }

    // Estimate token count (rough approximation)
    const estimatedTokens = Math.ceil(trimmed.length / 4);
    
    if (estimatedTokens > 500) {
      return { 
        valid: false, 
        error: 'Prompt is too long. Consider shortening it for better results.',
        estimatedTokens 
      };
    }

    return { valid: true, estimatedTokens };
  }, []);

  /**
   * Check if rate limited
   */
  const isRateLimited = useCallback((): boolean => {
    if (!rateLimitInfo) return false;
    
    const now = Date.now();
    return rateLimitInfo.remaining <= 0 && rateLimitInfo.resetTime > now;
  }, [rateLimitInfo]);

  /**
   * Get time until rate limit reset
   */
  const getTimeUntilReset = useCallback((): number => {
    if (!rateLimitInfo) return 0;
    
    const now = Date.now();
    const timeUntilReset = Math.max(0, rateLimitInfo.resetTime - now);
    return Math.ceil(timeUntilReset / 1000); // Return seconds
  }, [rateLimitInfo]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Actions
    generateArgument,
    checkStatus,
    validatePrompt,
    clearError,
    
    // State
    isGenerating,
    isCheckingStatus,
    error,
    rateLimitInfo,
    
    // Computed
    isRateLimited: isRateLimited(),
    timeUntilReset: getTimeUntilReset(),
    canGenerate: !isGenerating && !isRateLimited()
  };
} 