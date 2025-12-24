"use client";

import { useState, useCallback, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useTranslations } from 'next-intl';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder,
  className = "" 
}: Readonly<ChatInputProps>) {
  const [message, setMessage] = useState('');
  const t = useTranslations('common');

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  }, [message, disabled, onSendMessage]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className={`border-t border-gray-200 bg-white p-4 ${className}`}>
      <div className="flex flex-col space-y-3">
        {/* Input Area */}
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || "Type your message..."}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                disabled ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              rows={3}
              disabled={disabled}
              maxLength={1000}
            />
          </div>
          
          <div className="flex flex-col justify-end">
            <Button
              onClick={handleSend}
              disabled={!canSend}
              variant="primary"
              className="px-6 py-2 h-fit"
            >
              {disabled ? (
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
                  Sending...
                </span>
              ) : (
                'Send'
              )}
            </Button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="flex justify-between items-center">
          <Typography variant="body-xs" textColor="muted">
            Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to send
          </Typography>
          <Typography 
            variant="body-xs" 
            textColor={message.length > 900 ? "danger" : "muted"}
          >
            {message.length}/1000
          </Typography>
        </div>
      </div>
    </div>
  );
}
