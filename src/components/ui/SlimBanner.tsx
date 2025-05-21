"use client";

import { XMarkIcon } from '@heroicons/react/20/solid';
import { ReactNode, useState } from 'react';
import { Button } from './Button';
import { Link } from './Link';

export interface SlimBannerProps {
  /**
   * The banner's message content
   */
  children: ReactNode;
  
  /**
   * Link URL if the banner message is clickable
   */
  href?: string;
  
  /**
   * Whether to show a dismiss button
   */
  dismissible?: boolean;
  
  /**
   * CSS background color class
   */
  bgColor?: string;
  
  /**
   * CSS text color class
   */
  textColor?: string;
  
  /**
   * CSS class name to apply to the banner
   */
  className?: string;
  
  /**
   * Optional icon to show before the content
   */
  icon?: ReactNode;
  
  /**
   * Optional text for strong emphasis
   */
  emphasizedText?: string;
}

export function SlimBanner({
  children,
  href,
  dismissible = false,
  bgColor = "bg-gray-900",
  textColor = "text-white",
  className = "",
  icon,
  emphasizedText
}: Readonly<SlimBannerProps>) {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed) {
    return null;
  }
  
  const handleDismiss = () => {
    setDismissed(true);
  };
  
  const content = (
    <>
      {emphasizedText && (
        <>
          <strong className="font-semibold">{emphasizedText}</strong>
          <svg viewBox="0 0 2 2" aria-hidden="true" className="mx-2 inline size-0.5 fill-current">
            <circle r={1} cx={1} cy={1} />
          </svg>
        </>
      )}
      {children}
      {href && <span aria-hidden="true" className="ml-1">&rarr;</span>}
    </>
  );
  
  return (
    <div className={`flex items-center gap-x-6 ${bgColor} px-6 py-2.5 sm:px-3.5 sm:before:flex-1 ${className}`}>
      <p className={`text-sm/6 ${textColor} flex items-center`}>
        {icon && <span className="mr-2">{icon}</span>}
        
        {href ? (
          <Link href={href}>{content}</Link>
        ) : (
          content
        )}
      </p>
      
      {dismissible && (
        <div className="flex flex-1 justify-end">
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className={`-m-3 p-3 focus-visible:-outline-offset-4 hover:bg-opacity-20 ${textColor}`}
          >
            <span className="sr-only">Dismiss</span>
            <XMarkIcon aria-hidden="true" className="size-5" />
          </Button>
        </div>
      )}
    </div>
  );
} 