'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ToulminArgument } from '@/types/client';

export function useToulminArguments() {
  const [toulminArguments, setToulminArguments] = useState<ToulminArgument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchToulminArguments = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/argument', {
          headers: {
            'user-id': user.uid,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch arguments');
        }

        const data = await response.json();
        setToulminArguments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching arguments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToulminArguments();
  }, [user]);

  return { toulminArguments, isLoading, error };
} 