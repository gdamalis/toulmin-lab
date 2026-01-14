"use client";

import { useState, useEffect, useCallback } from "react";
import { ToulminArgument } from "@/types/client";
import { getCurrentUserToken } from "@/lib/auth/utils";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export function useArguments() {
  const [toulminArguments, setToulminArguments] = useState<ToulminArgument[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const fetchArguments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the authentication token
      const token = await getCurrentUserToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/argument", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to fetch arguments");
      }

      const { data } = await response.json();
      setToulminArguments(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Failed to load arguments:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getArgumentById = useCallback(async (id: string): Promise<ToulminArgument | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getCurrentUserToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/argument/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to fetch argument");
      }

      const { data } = await response.json();
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error(`Failed to fetch argument with ID ${id}:`, err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch arguments when auth is ready
    if (authReady) {
      fetchArguments();
    }
  }, [fetchArguments, authReady]);

  const createArgument = useCallback(async (argumentData: ToulminArgument) => {
    setIsCreating(true);

    try {
      const token = await getCurrentUserToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/argument", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ diagram: argumentData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to create argument");
      }

      const { data } = await response.json();
      const newId = data.id ?? data._id;

      // Optimistic update: add the new argument to the list immediately
      const newArgument: ToulminArgument = {
        ...argumentData,
        _id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setToulminArguments((prev) => [newArgument, ...prev]);

      return newId;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Failed to create argument:", err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const deleteArgument = useCallback(async (argumentId: string) => {
    setIsDeleting(true);
    
    try {
      const token = await getCurrentUserToken();
      
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`/api/argument/${argumentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to delete argument");
      }
      
      // Update the state to remove the deleted argument
      setToulminArguments((prev) =>
        prev.filter((arg) => arg._id?.toString() !== argumentId)
      );
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Failed to delete argument:", err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

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
        prev.map((arg) =>
          arg._id?.toString() === argumentId
            ? { ...argumentData, _id: argumentId, updatedAt: new Date().toISOString() }
            : arg
        )
      );

      const token = await getCurrentUserToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/argument/${argumentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(argumentData),
      });

      if (!response.ok) {
        // Rollback on error
        setToulminArguments(previousArguments);
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to update argument");
      }

      return true;
    } catch (err) {
      // Rollback on error
      setToulminArguments(previousArguments);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Failed to update argument:", err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [toulminArguments]);

  return {
    toulminArguments,
    isLoading,
    error,
    isDeleting,
    isUpdating,
    isCreating,
    createArgument,
    deleteArgument,
    updateArgument,
    getArgumentById,
    refreshArguments: fetchArguments,
  };
}
