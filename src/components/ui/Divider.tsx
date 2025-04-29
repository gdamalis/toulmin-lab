"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const dividerVariants = cva("w-full", {
  variants: {
    variant: {
      default: "border-b border-gray-900/10",
      light: "border-b border-gray-200",
      dark: "border-b border-gray-700",
    },
    spacing: {
      sm: "pb-4",
      md: "pb-6",
      lg: "pb-8",
    },
  },
  defaultVariants: {
    variant: "default",
    spacing: "lg",
  },
});

export interface DividerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  children?: React.ReactNode;
}

export function Divider({
  className,
  variant,
  spacing,
  children,
  ...props
}: Readonly<DividerProps>) {
  return (
    <div
      className={cn(dividerVariants({ variant, spacing, className }))}
      {...props}
    >
      {children}
    </div>
  );
} 