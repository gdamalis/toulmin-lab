'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { ClientChatMessage } from '@/types/coach';
import { SparklesIcon, UserIcon } from '@heroicons/react/24/outline';

interface MessageBubbleProps {
  message: ClientChatMessage;
  isStreaming?: boolean;
}

function MessageBubbleComponent({ message, isStreaming = false }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';
  
  return (
    <div
      className={cn(
        'flex gap-3',
        isAssistant ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isAssistant ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
        )}
      >
        {isAssistant ? (
          <SparklesIcon className="h-4 w-4" />
        ) : (
          <UserIcon className="h-4 w-4" />
        )}
      </div>
      
      {/* Message content */}
      <div
        className={cn(
          'flex max-w-[80%] flex-col gap-1 rounded-2xl px-4 py-2',
          isAssistant 
            ? 'bg-gray-100 text-gray-900 rounded-tl-none' 
            : 'bg-blue-600 text-white rounded-tr-none'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {isStreaming && (
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleComponent);
