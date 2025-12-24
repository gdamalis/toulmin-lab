"use client";

import { useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType, ToulminStep, DraftState, QualifierDraft, SuggestedAction } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { DraftCard } from './DraftCard';
import { Typography } from '@/components/ui/Typography';
import { useTranslations } from 'next-intl';

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  className?: string;
  onConfirm?: (text: string) => void;
  onRefine?: () => void;
  onSkip?: () => void;
  isConfirming?: boolean;
  currentStep?: ToulminStep;
  currentDraft?: DraftState | QualifierDraft;
  suggestedActions?: SuggestedAction[];
}

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading = false,
  className = "",
  onConfirm,
  onRefine,
  onSkip,
  isConfirming = false,
  currentStep,
  currentDraft,
  suggestedActions = []
}: Readonly<ChatInterfaceProps>) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const commonT = useTranslations('common');
  const dashboardT = useTranslations('pages.dashboard');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        
        // Try modern scrollTo with smooth behavior
        try {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        } catch (error) {
          // Fallback for older browsers
          container.scrollTop = container.scrollHeight;
        }
      }
    };

    // Use requestAnimationFrame for better performance
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(scrollToBottom);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <Typography variant="h3" className="text-lg font-medium text-gray-900 mb-2">
                {dashboardT("guidedChat.welcome.title")}
              </Typography>
              <Typography variant="body" textColor="muted" className="max-w-md">
                {dashboardT("guidedChat.welcome.description")}
              </Typography>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={message.id}>
                <ChatMessage message={message} />
                
                {/* Show draft card after last assistant message with draft state */}
                {message.role === 'assistant' && 
                 index === messages.length - 1 && 
                 message.metadata?.draftState && 
                 currentDraft && 
                 currentStep &&
                 onConfirm &&
                 onRefine &&
                 onSkip && (
                  <DraftCard
                    step={currentStep}
                    draft={currentDraft}
                    suggestedActions={suggestedActions}
                    onConfirm={onConfirm}
                    onRefine={onRefine}
                    onSkip={onSkip}
                    isProcessing={isConfirming}
                  />
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                    AI
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <Typography variant="body-sm" textColor="muted">
                        {dashboardT("guidedChat.messages.thinking")}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={isLoading}
        placeholder={dashboardT("guidedChat.messages.typeResponse")}
      />
    </div>
  );
}
