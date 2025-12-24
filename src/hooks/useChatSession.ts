"use client";

import { useState, useCallback, useEffect } from 'react';
import { 
  ChatSession, 
  ChatMessage, 
  CreateChatSessionRequest,
  ChatSessionResponse,
  ChatMessageResponse,
  ToulminStep 
} from '@/types/chat';
import { getCurrentUserToken } from '@/lib/auth/utils';
import { useNotification } from '@/contexts/NotificationContext';

export interface ChatSessionState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
  isCreating: boolean;
  isSending: boolean;
  error: string | null;
}

export function useChatSession() {
  const [state, setState] = useState<ChatSessionState>({
    currentSession: null,
    sessions: [],
    isLoading: false,
    isCreating: false,
    isSending: false,
    error: null
  });

  const { addNotification } = useNotification();

  /**
   * Fetch all chat sessions for the user
   */
  const fetchSessions = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = await getCurrentUserToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/chat/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sessions');
      }

      setState(prev => ({
        ...prev,
        sessions: data.data?.sessions || [],
        isLoading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      addNotification('error', 'Error', errorMessage);
    }
  }, [addNotification]);

  /**
   * Create a new chat session
   */
  const createSession = useCallback(async (
    request: CreateChatSessionRequest = {}
  ): Promise<ChatSession | null> => {
    setState(prev => ({ ...prev, isCreating: true, error: null }));

    try {
      const token = await getCurrentUserToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
      });

      const data: ChatSessionResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session');
      }

      const newSession = data.data!;
      
      console.log('Created session:', newSession);
      
      if (!newSession._id) {
        console.error('Session created without ID:', newSession);
        throw new Error('Session created without ID');
      }
      
      setState(prev => ({
        ...prev,
        currentSession: newSession,
        sessions: [newSession, ...prev.sessions],
        isCreating: false
      }));

      addNotification('success', 'Success', 'New guided session started!');
      return newSession;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isCreating: false
      }));
      addNotification('error', 'Error', errorMessage);
      return null;
    }
  }, [addNotification]);

  /**
   * Load a specific session
   */
  const loadSession = useCallback(async (sessionId: string): Promise<ChatSession | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = await getCurrentUserToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: ChatSessionResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load session');
      }

      const session = data.data!;
      
      setState(prev => ({
        ...prev,
        currentSession: session,
        isLoading: false
      }));

      return session;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      addNotification('error', 'Error', errorMessage);
      return null;
    }
  }, [addNotification]);

  /**
   * Send a message in the current session
   */
  const sendMessage = useCallback(async (content: string): Promise<{
    userMessage: ChatMessage;
    aiMessage: ChatMessage;
    nextStep?: ToulminStep;
    navigatedTo?: ToulminStep;
    confirmedPart?: string;
    advancedToStep?: ToulminStep;
  } | null> => {
    if (!state.currentSession) {
      addNotification('error', 'Error', 'No active session');
      return null;
    }

    if (!state.currentSession._id) {
      console.error('Session ID is missing:', state.currentSession);
      addNotification('error', 'Error', 'Session ID is missing. Please refresh the page.');
      return null;
    }

    setState(prev => ({ ...prev, isSending: true, error: null }));

    try {
      const token = await getCurrentUserToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/chat/sessions/${state.currentSession._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      const data: ChatMessageResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      const result = data.data!;
      
      // Determine effective step from navigation/confirmation
      const effectiveStep = result.currentStep || 
                           result.advancedToStep || 
                           result.navigatedTo || 
                           state.currentSession?.currentStep;
      
      // Update current session with new messages and progress
      setState(prev => ({
        ...prev,
        currentSession: prev.currentSession ? {
          ...prev.currentSession,
          messages: [...prev.currentSession.messages, result.userMessage, result.aiMessage],
          currentStep: effectiveStep || prev.currentSession.currentStep,
          argumentProgress: result.argumentProgress || prev.currentSession.argumentProgress,
          drafts: result.currentDraft ? {
            ...prev.currentSession.drafts,
            [effectiveStep || prev.currentSession.currentStep]: result.currentDraft
          } : prev.currentSession.drafts,
          suggestedActions: result.suggestedActions || prev.currentSession.suggestedActions,
          updatedAt: new Date()
        } : null,
        isSending: false
      }));

      return {
        userMessage: result.userMessage,
        aiMessage: result.aiMessage,
        nextStep: result.currentStep,
        navigatedTo: result.navigatedTo,
        confirmedPart: result.confirmedPart,
        advancedToStep: result.advancedToStep
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isSending: false
      }));
      addNotification('error', 'Error', errorMessage);
      return null;
    }
  }, [state.currentSession, addNotification]);

  /**
   * Navigate to a specific step (for revision or manual navigation)
   */
  const navigateToStep = useCallback(async (targetStep: ToulminStep): Promise<boolean> => {
    if (!state.currentSession?._id) {
      addNotification('error', 'Error', 'No active session');
      return false;
    }

    try {
      const token = await getCurrentUserToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `/api/chat/sessions/${state.currentSession._id}/navigate/${targetStep}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to navigate');
      }

      const result = data.data;

      // Update session with new step and any loaded draft
      setState(prev => ({
        ...prev,
        currentSession: prev.currentSession ? {
          ...prev.currentSession,
          currentStep: targetStep,
          messages: result.systemMessage 
            ? [...prev.currentSession.messages, result.systemMessage]
            : prev.currentSession.messages,
          drafts: result.currentDraft 
            ? { ...prev.currentSession.drafts, [targetStep]: result.currentDraft }
            : prev.currentSession.drafts,
          updatedAt: new Date()
        } : null
      }));

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      addNotification('error', 'Error', errorMessage);
      return false;
    }
  }, [state.currentSession, addNotification]);

  /**
   * Update session (title, status, etc.)
   */
  const updateSession = useCallback(async (
    sessionId: string,
    updates: Partial<ChatSession>
  ): Promise<boolean> => {
    try {
      const token = await getCurrentUserToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data: ChatSessionResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update session');
      }

      const updatedSession = data.data!;

      setState(prev => ({
        ...prev,
        currentSession: prev.currentSession?._id === sessionId ? updatedSession : prev.currentSession,
        sessions: prev.sessions.map(s => s._id === sessionId ? updatedSession : s)
      }));

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      addNotification('error', 'Error', errorMessage);
      return false;
    }
  }, [addNotification]);

  /**
   * Delete a session
   */
  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const token = await getCurrentUserToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete session');
      }

      setState(prev => ({
        ...prev,
        currentSession: prev.currentSession?._id === sessionId ? null : prev.currentSession,
        sessions: prev.sessions.filter(s => s._id !== sessionId)
      }));

      addNotification('success', 'Success', 'Session deleted successfully');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      addNotification('error', 'Error', errorMessage);
      return false;
    }
  }, [addNotification]);

  /**
   * Clear current session
   */
  const clearCurrentSession = useCallback(() => {
    setState(prev => ({ ...prev, currentSession: null }));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Check if argument is ready for completion
   */
  const isArgumentComplete = useCallback((): boolean => {
    if (!state.currentSession) return false;
    
    // Check if we're at 'done' step and have an argument ID
    return state.currentSession.currentStep === 'done' && 
           !!state.currentSession.generatedArgumentId;
  }, [state.currentSession]);

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    // State
    ...state,
    
    // Computed
    isArgumentComplete: isArgumentComplete(),
    
    // Actions
    fetchSessions,
    createSession,
    loadSession,
    sendMessage,
    navigateToStep,
    updateSession,
    deleteSession,
    clearCurrentSession,
    clearError
  };
}
