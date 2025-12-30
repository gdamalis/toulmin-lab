'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { StepIndicator } from './StepIndicator';
import { ElementHelper } from './ElementHelper';
import { ProposedUpdateCard } from './ProposedUpdateCard';
import { CompletionCard } from './CompletionCard';
import { 
  ClientChatMessage, 
  ClientArgumentDraft, 
  ToulminStep,
  CoachAIResult,
  ProposedUpdate,
  getNextStep,
  TOULMIN_STEPS,
} from '@/types/coach';
import { getStepCompletionStatus, ValidationLocale } from '@/lib/services/coach/stepCriteria';
import { getCurrentUserToken } from '@/lib/auth/utils';
import { 
  saveDraftField, 
  updateSessionStep, 
  addMessage,
  finalizeArgumentFromDraft,
} from '@/app/(user)/argument/coach/actions';
import { useTranslations, useLocale } from 'next-intl';

interface ChatPanelProps {
  readonly sessionId: string;
  readonly initialMessages: ClientChatMessage[];
  readonly initialDraft: ClientArgumentDraft;
  readonly initialStep: ToulminStep;
}

export function ChatPanel({
  sessionId,
  initialMessages,
  initialDraft,
  initialStep,
}: Readonly<ChatPanelProps>) {
  const t = useTranslations('pages.coach');
  const rawLocale = useLocale();
  const locale: ValidationLocale = rawLocale === 'es' ? 'es' : 'en';
  const [messages, setMessages] = useState<ClientChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState<ClientArgumentDraft>(initialDraft);
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Calculate completed steps using typed helper
  const completedSteps = getStepCompletionStatus(draft, locale);

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
        const parsed = tryParseCoachResult(line);
        if (parsed) {
          // Check if this is an error line from the server
          if (isCoachErrorLine(parsed)) {
            setStreamError(t('error.processingFailed'));
            continue;
          }
          parsedResult = parsed;
          if (parsed.assistantText) {
            setStreamingContent(parsed.assistantText);
          }
        }
      }
    }

    // Process remaining buffer
    const finalResult = tryParseCoachResult(buffer);
    if (finalResult && isCoachErrorLine(finalResult)) {
      setStreamError(t('error.processingFailed'));
      return parsedResult; // Return last valid result if any
    }
    return finalResult ?? parsedResult;
  }, [tryParseCoachResult, isCoachErrorLine, t]);

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
    if (result.proposedUpdate && result.proposedUpdate.field === currentStep) {
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
        setCurrentStep(nextStep);
        await updateSessionStep(sessionId, nextStep);
      }
    }

    if (result.isComplete) {
      await handleFinalization();
    }
  }, [sessionId, currentStep, createMessage, handleFinalization]);

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

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId, message }),
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
      console.error('Error sending message:', error);
      // Set error but keep any streaming content that was already displayed
      setStreamError(t('error.processingFailed'));
    } finally {
      setIsLoading(false);
      // Only clear streaming content if we don't have an error
      // This preserves partial content on stream failures
      if (!streamError) {
        setStreamingContent('');
      }
    }
  }, [sessionId, currentStep, createMessage, parseNDJSONStream, processAIResult, t, streamError]);

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
        const updatedDraft: ClientArgumentDraft = {
          ...draft,
          [proposedUpdate.field]: proposedUpdate.value,
          version: result.data.version,
        };
        setDraft(updatedDraft);
        setProposedUpdate(null);
        
        // Notify CoachView to update the diagram preview
        window.dispatchEvent(
          new CustomEvent('draftUpdated', { detail: updatedDraft })
        );

        // Determine if we should advance to the next step
        const isRebuttal = currentStep === TOULMIN_STEPS.REBUTTAL;
        const nextStep = isRebuttal ? null : getNextStep(currentStep);

        if (nextStep) {
          // Advance to next step
          setCurrentStep(nextStep);
          await updateSessionStep(sessionId, nextStep);
        }

        // Release loading before triggering next coach turn
        setIsLoading(false);

        // Trigger next coach turn to continue the flow
        // Use a hidden continuation message that won't appear in chat
        await requestCoachResponse(t('autoContinue'), { 
          emitUserMessage: false,
          stepOverride: nextStep ?? currentStep,
        });
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
  }, [sessionId, proposedUpdate, draft, isLoading, currentStep, requestCoachResponse, t]);

  const handleRejectProposal = useCallback(() => {
    setProposedUpdate(null);
  }, []);

  /**
   * Handle clicking on a completed step to edit it
   * Only completed non-current steps are clickable (enforced by StepIndicator)
   */
  const handleStepClick = useCallback(async (step: ToulminStep) => {
    // Clear any pending proposal when switching steps
    setProposedUpdate(null);
    setSaveError(undefined);
    
    // Update current step
    setCurrentStep(step);
    await updateSessionStep(sessionId, step);
    
    // Request coach to guide on this step again
    await requestCoachResponse(t('editStep'), { 
      emitUserMessage: false,
      stepOverride: step,
    });
  }, [sessionId, requestCoachResponse, t]);

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
