'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: ReactNode;
  content: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Simple tooltip using CSS hover
 * Lightweight alternative to full Headless UI Popover for simple use cases
 */
export function Tooltip({ 
  children, 
  content, 
  disabled = false,
  className,
}: TooltipProps) {
  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <div className={cn("group relative inline-block", className)}>
      {children}
      <div 
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 group-hover:block"
        role="tooltip"
      >
        <div className="whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg">
          {content}
          {/* Arrow */}
          <div className="absolute left-1/2 top-full -ml-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-gray-900" />
        </div>
      </div>
    </div>
  );
}

