'use client';

import Link from 'next/link';
import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { useNavigation } from '@/contexts/NavigationContext';

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-500 focus:ring-primary-500",
        secondary: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 focus:ring-primary-500",
        blue: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
        green: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
        purple: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        outline: "bg-transparent text-gray-700 hover:bg-gray-50 border border-gray-300 focus:ring-primary-500",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500",
        link: "bg-transparent underline-offset-4 hover:underline text-primary-600 hover:text-primary-700 p-0 focus:ring-primary-500",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  href?: string;
  isExternal?: boolean;
  isLoading?: boolean;
  tooltip?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant,
      size,
      disabled,
      href,
      isExternal = false,
      isLoading = false,
      tooltip,
      ...props
    },
    ref
  ) => {
    const { startNavigation } = useNavigation();
    const buttonClasses = cn(
      buttonVariants({ variant, size, className }),
      isLoading && 'opacity-70 cursor-wait',
      disabled && href && 'opacity-50 cursor-not-allowed pointer-events-none',
    );

    if (href) {
      // If disabled with href, render as non-interactive span
      if (disabled) {
        return (
          <span 
            className={buttonClasses}
            aria-disabled="true"
            title={tooltip}
          >
            {children}
          </span>
        );
      }
      
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses}
            title={tooltip}
          >
            {children}
          </a>
        );
      }
      
      return (
        <Link
          href={href}
          className={buttonClasses}
          onClick={() => startNavigation()}
          title={tooltip}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={buttonClasses}
        title={tooltip}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
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
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button }; 