'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: Readonly<CardProps>) {
  return (
    <div 
      className={cn("bg-white overflow-hidden shadow rounded-lg border border-gray-200", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ className, children, ...props }: Readonly<CardContentProps>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ className, children, ...props }: Readonly<CardFooterProps>) {
  return (
    <div className={cn("bg-gray-50 px-5 py-3", className)} {...props}>
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: ReactNode;
}

export function CardHeader({ 
  className, 
  children, 
  title,
  description,
  icon,
  ...props 
}: Readonly<CardHeaderProps>) {
  return (
    <div className={cn("p-5 border-b border-gray-200", className)} {...props}>
      {children || (
        <>
          {title && (
            <div className="flex items-center">
              {icon && <div className="flex-shrink-0 mr-3">{icon}</div>}
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </>
      )}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function CardTitle({ className, children, ...props }: Readonly<CardTitleProps>) {
  return (
    <h3 
      className={cn("text-lg font-medium text-gray-900", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function CardDescription({ className, children, ...props }: Readonly<CardDescriptionProps>) {
  return (
    <p 
      className={cn("mt-1 text-sm text-gray-500", className)}
      {...props}
    >
      {children}
    </p>
  );
} 