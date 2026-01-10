'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { PaperAirplaneIcon, PencilIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  isAwaitingRewrite?: boolean;
  rewriteStep?: string;
}

export function ChatInput({ 
  onSend, 
  isLoading = false,
  placeholder,
  isAwaitingRewrite = false,
  rewriteStep,
}: ChatInputProps) {
  const t = useTranslations('pages.coach');
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !isLoading) {
      onSend(trimmed);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {isAwaitingRewrite && rewriteStep && (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2">
          <PencilIcon className="h-4 w-4 text-amber-700" />
          <p className="text-sm text-amber-800">
            {t('rewritePrompt', { step: rewriteStep })}
          </p>
        </div>
      )}
      <div className="flex items-end gap-2 p-4">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t('typeResponse')}
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
          aria-label={t('typeResponse')}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          variant="primary"
          size="md"
          aria-label={t('sendMessage')}
        >
          <PaperAirplaneIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
