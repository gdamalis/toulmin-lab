'use client';

import { createContext, useContext, useState, useMemo, useCallback, ReactNode, useRef } from 'react';
import { 
  ClientArgumentDraft, 
  CoachUIState, 
  PendingRewrite, 
  EditingContext 
} from '@/types/coach';

export interface CoachQuotaState {
  used: number;
  limit: number | null;
  remaining: number | null;
  resetAt: string;
  isUnlimited: boolean;
}

interface CoachContextType {
  /** Current draft state shared between chat and diagram */
  draft: ClientArgumentDraft;
  /** Update draft and notify subscribers */
  updateDraft: (draft: ClientArgumentDraft) => void;
  /** Abort controller ref for cancelling in-flight requests */
  abortControllerRef: React.RefObject<AbortController | null>;
  /** Create a new abort controller, cancelling any existing one */
  createAbortController: () => AbortController;
  /** Current quota state (live updates from API calls) */
  quotaState: CoachQuotaState | null;
  /** Update quota state from API response headers */
  updateQuotaState: (state: CoachQuotaState) => void;
  /** UI State for state machine */
  uiState: CoachUIState;
  /** Set UI state */
  setUIState: (state: CoachUIState) => void;
  /** Pending rewrite context (when user clicks "Rewrite myself") */
  pendingRewrite: PendingRewrite | null;
  /** Set pending rewrite */
  setPendingRewrite: (rewrite: PendingRewrite | null) => void;
  /** Editing context (when navigating to previous step) */
  editingContext: EditingContext | null;
  /** Set editing context */
  setEditingContext: (ctx: EditingContext | null) => void;
}

const CoachContext = createContext<CoachContextType | undefined>(undefined);

export function useCoach() {
  const context = useContext(CoachContext);
  if (!context) {
    throw new Error('useCoach must be used within a CoachProvider');
  }
  return context;
}

interface CoachProviderProps {
  readonly children: ReactNode;
  readonly initialDraft: ClientArgumentDraft;
}

export function CoachProvider({ children, initialDraft }: CoachProviderProps) {
  const [draft, setDraft] = useState<ClientArgumentDraft>(initialDraft);
  const [quotaState, setQuotaState] = useState<CoachQuotaState | null>(null);
  const [uiState, setUIState] = useState<CoachUIState>('normal');
  const [pendingRewrite, setPendingRewrite] = useState<PendingRewrite | null>(null);
  const [editingContext, setEditingContext] = useState<EditingContext | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateDraft = useCallback((newDraft: ClientArgumentDraft) => {
    setDraft(newDraft);
  }, []);

  const updateQuotaState = useCallback((state: CoachQuotaState) => {
    setQuotaState(state);
  }, []);

  const createAbortController = useCallback(() => {
    // Cancel any existing request
    abortControllerRef.current?.abort();
    // Create new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller;
  }, []);

  const value = useMemo(() => ({
    draft,
    updateDraft,
    abortControllerRef,
    createAbortController,
    quotaState,
    updateQuotaState,
    uiState,
    setUIState,
    pendingRewrite,
    setPendingRewrite,
    editingContext,
    setEditingContext,
  }), [draft, updateDraft, createAbortController, quotaState, updateQuotaState, uiState, pendingRewrite, editingContext]);

  return <CoachContext.Provider value={value}>{children}</CoachContext.Provider>;
}
