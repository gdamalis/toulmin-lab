"use client";

import { useState, useCallback } from "react";
import { ToulminArgument } from "@/types/client";
import { apiClient } from "@/lib/api/client";
import { useApiQuery } from "../api/useApiQuery";

export function useArguments() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { 
    data: toulminArguments, 
    isLoading, 
    error, 
    refetch: refreshArguments,
    setData: setToulminArguments 
  } = useApiQuery<ToulminArgument[]>('/api/argument');

  const getArgumentById = useCallback(async (id: string): Promise<ToulminArgument | null> => {
    const result = await apiClient.get<ToulminArgument>(`/api/argument/${id}`);
    return result.success && result.data ? result.data : null;
  }, []);

  const createArgument = useCallback(async (argumentData: ToulminArgument) => {
    setIsCreating(true);

    try {
      const result = await apiClient.post<{ id: string }>('/api/argument', { diagram: argumentData });
      
      if (result.success && result.data) {
        const newId = result.data.id;

        // Optimistic update: add the new argument to the list immediately
        const newArgument: ToulminArgument = {
          ...argumentData,
          _id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setToulminArguments((prev) => prev ? [newArgument, ...prev] : [newArgument]);

        return newId;
      }
      
      return null;
    } catch (err) {
      console.error("Failed to create argument:", err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [setToulminArguments]);

  const deleteArgument = useCallback(async (argumentId: string) => {
    setIsDeleting(true);
    
    try {
      const result = await apiClient.delete(`/api/argument/${argumentId}`);
      
      if (result.success) {
        // Update the state to remove the deleted argument
        setToulminArguments((prev) =>
          prev ? prev.filter((arg) => arg._id?.toString() !== argumentId) : prev
        );
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Failed to delete argument:", err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [setToulminArguments]);

  const updateArgument = useCallback(async (
    argumentId: string,
    argumentData: ToulminArgument
  ) => {
    setIsUpdating(true);

    // Store previous state for rollback on error
    const previousArguments = toulminArguments;

    try {
      // Optimistic update: update the argument in the list immediately
      setToulminArguments((prev) =>
        prev ? prev.map((arg) =>
          arg._id?.toString() === argumentId
            ? { ...argumentData, _id: argumentId, updatedAt: new Date().toISOString() }
            : arg
        ) : prev
      );

      const result = await apiClient.put(`/api/argument/${argumentId}`, argumentData);

      if (!result.success) {
        // Rollback on error
        setToulminArguments(previousArguments);
        return false;
      }

      return true;
    } catch (err) {
      // Rollback on error
      setToulminArguments(previousArguments);
      console.error("Failed to update argument:", err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [toulminArguments, setToulminArguments]);

  return {
    toulminArguments: toulminArguments ?? [],
    isLoading,
    error,
    isDeleting,
    isUpdating,
    isCreating,
    createArgument,
    deleteArgument,
    updateArgument,
    getArgumentById,
    refreshArguments,
  };
}
