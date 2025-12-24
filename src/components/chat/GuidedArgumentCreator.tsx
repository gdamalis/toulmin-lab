"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatSession } from "@/hooks/useChatSession";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { ChatInterface } from "./ChatInterface";
import { ArgumentProgress } from "./ArgumentProgress";
import { StepFocusChip } from "./StepFocusChip";
import { useTranslations, useLocale } from "next-intl";
import { Locale } from "@/i18n/settings";
import useNotification from "@/hooks/useNotification";
import { getCurrentUserToken } from "@/lib/auth/utils";
import { stepToPartName } from "@/lib/services/chat-ai";

interface GuidedArgumentCreatorProps {
  className?: string;
}

export function GuidedArgumentCreator({
  className = "",
}: Readonly<GuidedArgumentCreatorProps>) {
  const commonT = useTranslations("common");
  const dashboardT = useTranslations("pages.dashboard");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { showSuccess, showError } = useNotification();

  const {
    currentSession,
    isLoading,
    isCreating,
    isSending,
    error,
    createSession,
    sendMessage,
    clearError,
    isArgumentComplete,
    loadSession
  } = useChatSession();

  const [isConfirming, setIsConfirming] = useState(false);

  const handleStartNewSession = useCallback(async () => {
    try {
      const session = await createSession({
        title: `Guided Argument - ${new Date().toLocaleDateString()}`,
        language: locale
      });

      if (session) {
        // Session created successfully
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }, [createSession, locale]);

  // Initialize session on mount if none exists
  useEffect(() => {
    if (!currentSession && !isLoading && !isCreating) {
      handleStartNewSession();
    }
  }, [currentSession, isLoading, isCreating, handleStartNewSession]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentSession) {
      showError(commonT("error"), dashboardT("guidedChat.messages.noActiveSession"));
      return;
    }

    try {
      clearError();
      await sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [currentSession, sendMessage, clearError, showError, commonT, dashboardT]);

  const handleConfirm = useCallback(async (confirmedText: string) => {
    if (!currentSession) return;
    
    setIsConfirming(true);
    try {
      const token = await getCurrentUserToken();
      const partName = stepToPartName(currentSession.currentStep);
      
      if (!partName) {
        throw new Error('Invalid step');
      }
      
      const response = await fetch(
        `/api/chat/sessions/${currentSession._id}/confirm/${partName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ confirmedText })
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm');
      }
      
      // Reload session to get updated state
      if (currentSession._id) {
        await loadSession(currentSession._id);
      }
      
      showSuccess(commonT("success"), "Part confirmed! Moving to next step.");
      
    } catch (error) {
      showError(commonT("error"), error instanceof Error ? error.message : "Failed to confirm");
    } finally {
      setIsConfirming(false);
    }
  }, [currentSession, loadSession, showSuccess, showError, commonT]);

  const handleSkip = useCallback(async () => {
    if (!currentSession) return;
    
    setIsConfirming(true);
    try {
      const token = await getCurrentUserToken();
      const partName = stepToPartName(currentSession.currentStep);
      
      if (!partName) {
        throw new Error('Invalid step');
      }
      
      const response = await fetch(
        `/api/chat/sessions/${currentSession._id}/skip/${partName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to skip');
      }
      
      // Reload session to get updated state
      if (currentSession._id) {
        await loadSession(currentSession._id);
      }
      
      showSuccess(commonT("success"), "Step skipped. Moving to next step.");
      
    } catch (error) {
      showError(commonT("error"), error instanceof Error ? error.message : "Failed to skip");
    } finally {
      setIsConfirming(false);
    }
  }, [currentSession, loadSession, showSuccess, showError, commonT]);

  const handleCompleteArgument = useCallback(async () => {
    if (!currentSession || !isArgumentComplete) {
      showError(commonT("error"), dashboardT("guidedChat.messages.argumentNotComplete"));
      return;
    }

    setIsConfirming(true);

    try {
      const token = await getCurrentUserToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/chat/sessions/${currentSession._id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete argument');
      }

      const { argumentId } = data.data;

      showSuccess(
        commonT("success"),
        dashboardT("guidedChat.messages.argumentCreated")
      );
      
      // Redirect to the argument view
      router.push(`/argument/view/${argumentId}`);
    } catch (error) {
      console.error("Error creating argument:", error);
      showError(
        commonT("error"),
        error instanceof Error ? error.message : dashboardT("guidedChat.messages.failedToCreate")
      );
    } finally {
      setIsConfirming(false);
    }
  }, [
    currentSession,
    isArgumentComplete,
    router,
    showSuccess,
    showError,
    commonT,
    dashboardT
  ]);

  const handleStartOver = useCallback(async () => {
    await handleStartNewSession();
  }, [handleStartNewSession]);

  const handleRefine = useCallback(() => {
    // Just trigger focus on input - user can continue chatting to refine
    showSuccess(commonT("success"), "Please provide more details to refine this part.");
  }, [showSuccess, commonT]);

  // Show loading state while creating session
  if (isCreating || (isLoading && !currentSession)) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <Typography textColor="muted">Starting your guided session...</Typography>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no session could be created
  if (!currentSession && !isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <Typography variant="h2" className="text-xl font-semibold text-gray-900 mb-2">
            {dashboardT("guidedChat.messages.unableToStart")}
          </Typography>
          <Typography variant="body" textColor="muted" className="mb-4">
            {dashboardT("guidedChat.messages.problemStarting")}
          </Typography>
          <Button onClick={handleStartNewSession} variant="primary">
            {dashboardT("guidedChat.buttons.tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StepFocusChip currentStep={currentSession?.currentStep || 'intro'} />
            <div>
              <Typography variant="h2" className="text-xl font-semibold text-gray-900">
                {dashboardT("guidedChat.title")}
              </Typography>
              <Typography variant="body-sm" textColor="muted" className="mt-1">
                {dashboardT("guidedChat.description")}
              </Typography>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentSession?.currentStep === 'done' && currentSession.generatedArgumentId && (
              <Button
                onClick={handleCompleteArgument}
                disabled={isConfirming}
                variant="primary"
                className="min-w-[140px]"
              >
                {isConfirming ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {dashboardT("guidedChat.buttons.creating")}
                  </span>
                ) : (
                  "View Argument"
                )}
              </Button>
            )}
            
            <Button
              onClick={handleStartOver}
              variant="secondary"
              disabled={isCreating || isConfirming}
            >
              {dashboardT("guidedChat.buttons.startOver")}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
        {/* Chat Interface */}
        <div className="lg:col-span-2 border-r border-gray-200 flex flex-col min-h-0">
          <ChatInterface
            messages={currentSession?.messages || []}
            onSendMessage={handleSendMessage}
            isLoading={isSending}
            onConfirm={handleConfirm}
            onRefine={handleRefine}
            onSkip={handleSkip}
            isConfirming={isConfirming}
            currentStep={currentSession?.currentStep || 'intro'}
            currentDraft={currentSession?.drafts?.[currentSession.currentStep as keyof typeof currentSession.drafts]}
            suggestedActions={currentSession?.suggestedActions || []}
          />
        </div>

        {/* Progress Sidebar */}
        <div className="p-4 bg-gray-50 overflow-y-auto">
          <ArgumentProgress
            currentStep={currentSession?.currentStep || 'intro'}
            argumentProgress={currentSession?.argumentProgress || {}}
          />
          
          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
              <Typography variant="body-sm" className="text-red-800">
                {error}
              </Typography>
              <Button
                onClick={clearError}
                variant="secondary"
                className="mt-2 text-xs"
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
