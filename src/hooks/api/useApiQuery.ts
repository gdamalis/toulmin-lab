"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api/client';
import { useAuthReady } from '../auth/useAuthReady';

interface UseApiQueryOptions<T> {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

/**
 * Base hook for data fetching with authentication
 * Automatically waits for auth to be ready before fetching
 * 
 * @example
 * const { data, isLoading, error, refetch } = useApiQuery<User[]>('/api/users');
 */
export function useApiQuery<T>(
  endpoint: string,
  options: UseApiQueryOptions<T> = {}
) {
  const { enabled = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authReady } = useAuthReady();

  // Use refs to store latest callbacks without causing re-renders
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const refetch = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    const result = await apiClient.get<T>(endpoint);
    
    if (result.success && result.data) {
      setData(result.data);
      onSuccessRef.current?.(result.data);
    } else {
      const errorMsg = result.error ?? 'Failed to fetch data';
      setError(errorMsg);
      onErrorRef.current?.(errorMsg);
    }
    
    setIsLoading(false);
    isFetchingRef.current = false;
  }, [endpoint]);

  useEffect(() => {
    if (authReady && enabled) {
      refetch();
    }
  }, [authReady, enabled, refetch]);

  return { data, isLoading, error, refetch, setData };
}
