"use client";

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/responses';

type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface UseApiMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

/**
 * Base hook for data mutations (POST, PUT, PATCH, DELETE)
 * Handles loading states and error handling
 * 
 * @example
 * const { mutate, isLoading } = useApiMutation<CreateData, Response>('/api/users', 'POST');
 * await mutate({ name: 'John' });
 */
export function useApiMutation<TData, TResponse = unknown>(
  endpoint: string,
  method: HttpMethod = 'POST',
  options: UseApiMutationOptions<TResponse> = {}
) {
  const { onSuccess, onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data?: TData): Promise<ApiResponse<TResponse>> => {
    setIsLoading(true);
    setError(null);
    
    let result: ApiResponse<TResponse>;
    
    switch (method) {
      case 'POST':
        result = await apiClient.post<TResponse>(endpoint, data);
        break;
      case 'PUT':
        result = await apiClient.put<TResponse>(endpoint, data);
        break;
      case 'PATCH':
        result = await apiClient.patch<TResponse>(endpoint, data);
        break;
      case 'DELETE':
        result = await apiClient.delete<TResponse>(endpoint);
        break;
    }
    
    if (result.success && result.data) {
      onSuccess?.(result.data);
    } else if (!result.success) {
      const errorMsg = result.error ?? 'Operation failed';
      setError(errorMsg);
      onError?.(errorMsg);
    }
    
    setIsLoading(false);
    return result;
  }, [endpoint, method, onSuccess, onError]);

  return { mutate, isLoading, error };
}
