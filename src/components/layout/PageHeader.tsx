"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary";
}

interface PageHeaderProps {
  title: string;
  buttons?: ButtonProps[];
  children?: ReactNode;
}

export function PageHeader({ title, buttons, children }: PageHeaderProps) {
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {title}
        </h2>
        {children}
      </div>
      {buttons && buttons.length > 0 && (
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          {buttons.map((button, index) => {
            const isPrimary = button.variant !== "secondary";
            const className = `inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 ${
              isPrimary
                ? "bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-primary-600"
                : "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            }`;
            
            return button.href ? (
              <Link
                key={index}
                href={button.href}
                className={className}
              >
                {button.text}
              </Link>
            ) : (
              <button
                key={index}
                type="button"
                onClick={button.onClick}
                className={className}
              >
                {button.text}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
} 