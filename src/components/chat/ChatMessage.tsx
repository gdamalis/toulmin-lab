"use client";

import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Typography } from '@/components/ui/Typography';
import { formatDistanceToNow } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface ChatMessageProps {
  message: ChatMessageType;
  className?: string;
}

export function ChatMessage({ message, className = "" }: Readonly<ChatMessageProps>) {
  const locale = useLocale();
  const dateLocale = locale === 'es' ? es : enUS;

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const formatTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: dateLocale
    });
  };

  if (isSystem) {
    return (
      <div className={`flex justify-center my-4 ${className}`}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 max-w-md">
          <Typography variant="body-sm" className="text-blue-800 text-center">
            {message.content}
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${className}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            {isUser ? 'U' : 'AI'}
          </div>
          
          {/* Message Content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`rounded-lg px-4 py-3 shadow-sm ${
              isUser 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border border-gray-200'
            }`}>
              <Typography 
                variant="body" 
                className={`whitespace-pre-wrap ${isUser ? 'text-white' : 'text-gray-900'}`}
              >
                {message.content}
              </Typography>
              
              {/* Metadata */}
              {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <Typography variant="body-sm" className="text-gray-600 mb-1">
                    Suggestions:
                  </Typography>
                  <ul className="list-disc list-inside space-y-1">
                    {message.metadata.suggestions.map((suggestion, index) => (
                      <li key={index}>
                        <Typography variant="body-sm" className="text-gray-600">
                          {suggestion}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Timestamp */}
            <Typography 
              variant="body-xs" 
              textColor="muted" 
              className={`mt-1 ${isUser ? 'text-right' : 'text-left'}`}
            >
              {formatTime(message.timestamp)}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}
