"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary";
}

interface PageHeaderProps {
  title?: string;
  buttons?: ButtonProps[];
  children?: ReactNode;
}

export function PageHeader({
  title,
  buttons,
  children,
}: Readonly<PageHeaderProps>) {
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        {title && (
          <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {title}
          </h2>
        )}
        {children}
      </div>
      {buttons && buttons.length > 0 && (
        <div className="flex gap-3 md:self-start">
          {buttons.map((button) => {
            const buttonVariant =
              button.variant === "secondary" ? "outline" : "primary";

            return (
              <Button
                key={button.text}
                onClick={button.onClick}
                href={button.href}
                variant={buttonVariant}
              >
                {button.text}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
