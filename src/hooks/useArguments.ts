'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ToulminArgument } from '@/types/client';

export function useToulminArguments() {
  const [toulminArguments, setToulminArguments] = useState<ToulminArgument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchToulminArguments = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get the current user's ID token
        const token = await user.getIdToken();

        const response = await fetch("/api/argument", {
          headers: {
            "user-id": user.uid,
            "Authorization": `Bearer ${token}`,
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

  const deleteArgument = async (argumentId: string) => {
    if (!user) return false;
    
    setIsDeleting(true);
    try {
      const token = await user.getIdToken();
      
      const response = await fetch(`/api/argument/${argumentId}`, {
        method: 'DELETE',
        headers: {
          "user-id": user.uid,
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete argument');
      }
      
      // Update the state to remove the deleted argument
      setToulminArguments(prev => prev.filter(arg => arg._id?.toString() !== argumentId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while deleting');
      console.error('Error deleting argument:', err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { toulminArguments, isLoading, error, deleteArgument, isDeleting };
} 