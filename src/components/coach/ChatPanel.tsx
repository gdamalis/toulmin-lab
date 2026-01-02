'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { StepIndicator } from './StepIndicator';
import { ElementHelper } from './ElementHelper';
import { ProposedUpdateCard } from './ProposedUpdateCard';
import { CompletionCard } from './CompletionCard';
import { 
  ClientChatMessage, 
  ToulminStep,
  CoachAIResult,
  ProposedUpdate,
  getNextStep,
  TOULMIN_STEPS,
  TOULMIN_STEP_ORDER,
} from '@/types/coach';
import { getStepCompletionStatus, findFirstIncompleteStep, ValidationLocale } from '@/lib/services/coach/stepCriteria';
import { getCurrentUserToken } from '@/lib/auth/utils';
import { 
  saveDraftField, 
  updateSessionStep, 
  addMessage,
  finalizeArgumentFromDraft,
} from '@/app/(user)/argument/coach/actions';
import { useTranslations, useLocale } from 'next-intl';
import { useCoach } from '@/contexts/CoachContext';

interface ChatPanelProps {
  readonly sessionId: string;
  readonly initialMessages: ClientChatMessage[];
  readonly initialStep: ToulminStep;
}

export function ChatPanel({
  sessionId,
  initialMessages,
  initialStep,
}: Readonly<ChatPanelProps>) {
  const t = useTranslations('pages.coach');
  const rawLocale = useLocale();
  const locale: ValidationLocale = rawLocale === 'es' ? 'es' : 'en';
  
  // Get draft and abort controller from context
  const { draft, updateDraft, createAbortController, abortControllerRef } = useCoach();
  
  const [messages, setMessages] = useState<ClientChatMessage[]>(initialMessages);
  const [currentStep, setCurrentStep] = useState<ToulminStep>(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [proposedUpdate, setProposedUpdate] = useState<ProposedUpdate | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [argumentId, setArgumentId] = useState<string | undefined>();
  const [finalizationError, setFinalizationError] = useState<string | undefined>();
  const [isRetrying, setIsRetrying] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();
  const [streamError, setStreamError] = useState<string | null>(null);
  const [editingStepFrom, setEditingStepFrom] = useState<ToulminStep | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Cleanup: abort any in-flight request on unmount
  useEffect(() => {
    const controller = abortControllerRef.current;
    return () => {
      controller?.abort();
    };
  }, [abortControllerRef]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Calculate completed steps using typed helper - memoized to avoid recalc on every render
  const completedSteps = useMemo(
    () => getStepCompletionStatus(draft, locale),
    [draft, locale]
  );

  const handleFinalization = useCallback(async () => {
    if (isComplete || argumentId) return;
    
    setFinalizationError(undefined);
    
    try {
      const result = await finalizeArgumentFromDraft(sessionId);
      
      if (result.success && result.data) {
        setIsComplete(true);
        setArgumentId(result.data.argumentId);
      } else {
        setFinalizationError(result.error ?? t('error.saveFailed'));
      }
    } catch (error) {
      console.error('Finalization error:', error);
      setFinalizationError(t('error.unexpectedError'));
    }
  }, [sessionId, isComplete, argumentId, t]);

  /**
   * Create a client chat message helper
   */
  const createMessage = useCallback((
    role: 'user' | 'assistant',
    content: string,
    step?: ToulminStep
  ): ClientChatMessage => ({
    id: `${role}-${Date.now()}`,
    sessionId,
    role,
    content,
    createdAt: new Date().toISOString(),
    step,
  }), [sessionId]);

  /**
   * Check if a parsed line is an error response from the server
   */
  const isCoachErrorLine = useCallback((value: unknown): value is { error: string } => {
    return Boolean(value && typeof value === 'object' && 'error' in value);
  }, []);

  /**
   * Try to parse a line as CoachAIResult
   */
  const tryParseCoachResult = useCallback((line: string): CoachAIResult | null => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    
    try {
      return JSON.parse(trimmed) as CoachAIResult;
    } catch {
      return null;
    }
  }, []);

  /**
   * Process a single parsed result, updating state as needed.
   * Returns the result if valid, null otherwise.
   */
  const processStreamLine = useCallback((
    parsed: CoachAIResult | null,
    currentResult: CoachAIResult | null
  ): CoachAIResult | null => {
    if (!parsed) return currentResult;
    
    if (isCoachErrorLine(parsed)) {
      setStreamError(t('error.processingFailed'));
      return currentResult;
    }
    
    if (parsed.assistantText) {
      setStreamingContent(parsed.assistantText);
    }
    return parsed;
  }, [isCoachErrorLine, t]);

  /**
   * Parse NDJSON stream and return the final result
   */
  const parseNDJSONStream = useCallback(async (
    reader: ReadableStreamDefaultReader<Uint8Array>
  ): Promise<CoachAIResult | null> => {
    const decoder = new TextDecoder();
    let buffer = '';
    let parsedResult: CoachAIResult | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        parsedResult = processStreamLine(tryParseCoachResult(line), parsedResult);
      }
    }

    // Process remaining buffer
    return processStreamLine(tryParseCoachResult(buffer), parsedResult);
  }, [tryParseCoachResult, processStreamLine]);

  /**
   * Process the AI result after streaming completes
   */
  const processAIResult = useCallback(async (result: CoachAIResult) => {
    const assistantMessage = createMessage('assistant', result.assistantText, currentStep);
    setMessages((prev) => [...prev, assistantMessage]);
    setStreamingContent('');

    await addMessage(sessionId, 'assistant', result.assistantText, currentStep);

    // Only accept proposedUpdate when the field matches the current step
    // This prevents the model from proposing updates to wrong fields
    if (result.proposedUpdate?.field === currentStep) {
      setProposedUpdate(result.proposedUpdate);
    } else if (result.proposedUpdate) {
      console.warn(`Ignoring proposedUpdate for field '${result.proposedUpdate.field}' - expected '${currentStep}'`);
    }

    // SAVE-DRIVEN step progression:
    // We only advance in processAIResult if the draft already has content for this step
    // (editing flow). For new content, advancement happens in handleConfirmProposal
    // after the user clicks "Use this" and the save succeeds.
    // This prevents skipping steps when the model sets shouldAdvance=true
    // without the user ever confirming a proposal.
    const stepHasContent = draft[currentStep]?.trim() !== '';
    const canAdvanceAutomatically = result.shouldAdvance && stepHasContent && currentStep !== TOULMIN_STEPS.REBUTTAL;

    if (canAdvanceAutomatically) {
      const nextStep = getNextStep(currentStep);
      if (nextStep) {
        // Clear editing state since we're advancing forward
        setEditingStepFrom(null);
        setCurrentStep(nextStep);
        await updateSessionStep(sessionId, nextStep);
      }
    }

    if (result.isComplete) {
      await handleFinalization();
    }
  }, [sessionId, currentStep, draft, createMessage, handleFinalization]);

  /**
   * Request a coach response from the API
   * @param message - The message to send
   * @param options.emitUserMessage - Whether to add user message to chat (default: true)
   * @param options.stepOverride - Override the current step for this request
   */
  const requestCoachResponse = useCallback(async (
    message: string,
    options: { emitUserMessage?: boolean; stepOverride?: ToulminStep } = {}
  ): Promise<void> => {
    const { emitUserMessage = true, stepOverride } = options;
    const activeStep = stepOverride ?? currentStep;

    const token = await getCurrentUserToken();
    if (!token) {
      const errorMessage = createMessage('assistant', t('error.authRequired'));
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    setIsLoading(true);
    setStreamingContent('');
    setProposedUpdate(null);
    setStreamError(null);

    if (emitUserMessage) {
      const userMessage = createMessage('user', message, activeStep);
      setMessages((prev) => [...prev, userMessage]);
    }

    // Create abort controller for this request
    const abortController = createAbortController();

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId, message }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? 'Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const parsedResult = await parseNDJSONStream(reader);
      // Only process if we have a valid result with non-empty assistantText
      if (
        parsedResult &&
        typeof parsedResult.assistantText === 'string' &&
        parsedResult.assistantText.trim() !== ''
      ) {
        await processAIResult(parsedResult);
      } else if (parsedResult) {
        // We got a result but assistantText is invalid - log and show error
        console.warn('Received invalid AI result:', parsedResult);
        setStreamError(t('error.processingFailed'));
      }
    } catch (error) {
      // Don't show error for aborted requests
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Error sending message:', error);
      // Set error but keep any streaming content that was already displayed
      setStreamError(t('error.processingFailed'));
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  }, [sessionId, currentStep, createMessage, createAbortController, parseNDJSONStream, processAIResult, t]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (isLoading || isComplete) return;
    await requestCoachResponse(content, { emitUserMessage: true });
  }, [isLoading, isComplete, requestCoachResponse]);

  const handleRetryFinalization = useCallback(async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    await handleFinalization();
    setIsRetrying(false);
  }, [isRetrying, handleFinalization]);

  const handleConfirmProposal = useCallback(async () => {
    if (!proposedUpdate || isLoading) return;

    setIsLoading(true);
    setSaveError(undefined);
    
    try {
      const result = await saveDraftField(
        sessionId,
        proposedUpdate.field,
        proposedUpdate.value,
        draft.version
      );

      if (result.success && result.data) {
        const updatedDraft = {
          ...draft,
          [proposedUpdate.field]: proposedUpdate.value,
          version: result.data.version,
          // Update name if a title was generated
          ...(result.data.name && { name: result.data.name }),
        };
        // Update draft via context - this will sync the diagram automatically
        updateDraft(updatedDraft);
        setProposedUpdate(null);

        // Determine if we should advance to the next step
        const isRebuttal = currentStep === TOULMIN_STEPS.REBUTTAL;
        const nextStep = isRebuttal ? null : getNextStep(currentStep);

        if (nextStep) {
          // Advance to next step - clear editing state since we're moving forward
          setEditingStepFrom(null);
          setCurrentStep(nextStep);
          await updateSessionStep(sessionId, nextStep);
        }

        // Release loading before triggering next coach turn
        setIsLoading(false);

        if (isRebuttal) {
          // Rebuttal is the last step - finalize the argument
          await handleFinalization();
        } else {
          // Trigger next coach turn to continue the flow
          // Use a hidden continuation message that won't appear in chat
          await requestCoachResponse(t('autoContinue'), { 
            emitUserMessage: false,
            stepOverride: nextStep ?? currentStep,
          });
        }
      } else {
        const errorMsg = result.error ?? t('error.saveFailedRetry');
        setSaveError(errorMsg);
        console.error('Failed to save draft:', result.error);
        setIsLoading(false);
      }
    } catch (error) {
      setSaveError(t('error.unexpectedError'));
      console.error('Error saving draft:', error);
      setIsLoading(false);
    }
  }, [sessionId, proposedUpdate, draft, isLoading, currentStep, updateDraft, requestCoachResponse, handleFinalization, t]);

  const handleRejectProposal = useCallback(() => {
    setProposedUpdate(null);
  }, []);

  /**
   * Handle clicking on a completed step to edit it
   * Only completed non-current steps are clickable (enforced by StepIndicator)
   * If there are incomplete steps ahead of the clicked step, reroute to the first one
   */
  const handleStepClick = useCallback(async (step: ToulminStep) => {
    // Clear any pending proposal when switching steps
    setProposedUpdate(null);
    setSaveError(undefined);
    
    // Check if there are incomplete steps ahead of the clicked step
    const clickedIndex = TOULMIN_STEP_ORDER.indexOf(step);
    const firstIncomplete = findFirstIncompleteStep(draft, locale);
    
    // If there's an incomplete step ahead, reroute to it instead
    if (firstIncomplete) {
      const incompleteIndex = TOULMIN_STEP_ORDER.indexOf(firstIncomplete);
      if (incompleteIndex > clickedIndex) {
        // Reroute to the first incomplete step
        setEditingStepFrom(null); // Clear editing state since we're moving to an incomplete step
        setCurrentStep(firstIncomplete);
        await updateSessionStep(sessionId, firstIncomplete);
        await requestCoachResponse(t('autoContinue'), { 
          emitUserMessage: false,
          stepOverride: firstIncomplete,
        });
        return;
      }
    }
    
    // Track that we're editing from a previous step
    setEditingStepFrom(step);
    
    // Update current step
    setCurrentStep(step);
    await updateSessionStep(sessionId, step);
    
    // Request coach to guide on this step again
    await requestCoachResponse(t('editStep'), { 
      emitUserMessage: false,
      stepOverride: step,
    });
  }, [sessionId, draft, locale, requestCoachResponse, t]);

  if (isComplete || argumentId) {
    return (
      <div className="flex h-full flex-col p-4">
        <CompletionCard 
          argumentId={argumentId} 
          error={finalizationError}
          onRetry={handleRetryFinalization}
          isRetrying={isRetrying}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Step indicator */}
      <div className="border-b border-gray-200 bg-white p-4">
        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />
        {/* Editing chip - shows when editing a previous step */}
        {editingStepFrom && (
          <div className="mt-2 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              {t('editingStep', { step: t(`steps.${editingStepFrom}`) })}
            </span>
          </div>
        )}
        <div className="mt-3 flex justify-center">
          <ElementHelper step={currentStep} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {/* Streaming message */}
        {streamingContent && (
          <MessageBubble
            message={{
              id: 'streaming',
              sessionId,
              role: 'assistant',
              content: streamingContent,
              createdAt: new Date().toISOString(),
            }}
            isStreaming
          />
        )}

        {/* Proposed update */}
        {proposedUpdate && (
          <ProposedUpdateCard
            proposal={proposedUpdate}
            onConfirm={handleConfirmProposal}
            onReject={handleRejectProposal}
            isLoading={isLoading}
          />
        )}

        {/* Save error */}
        {saveError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {/* Stream error */}
        {streamError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            {streamError}
          </div>
        )}

        {/* Finalization error */}
        {finalizationError && (
          <CompletionCard
            error={finalizationError}
            onRetry={handleRetryFinalization}
            isRetrying={isRetrying}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        isLoading={isLoading}
        placeholder={t('describeStep', { step: t(`steps.${currentStep}`) })}
      />
    </div>
  );
}
