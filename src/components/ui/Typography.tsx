"use client";

import { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "text-3xl font-bold tracking-tight",
      h2: "text-2xl font-bold",
      h3: "text-xl font-medium",
      h4: "text-lg font-medium",
      h5: "text-base font-medium",
      h6: "text-sm font-medium",
      "body-lg": "text-lg",
      body: "text-base",
      "body-sm": "text-sm",
      body1: "text-base",
      body2: "text-sm",
      caption: "text-xs",
      overline: "text-xs uppercase tracking-wider",
    },
    textColor: {
      default: "text-gray-900",
      muted: "text-gray-500",
      white: "text-white",
      primary: "text-primary-600",
      success: "text-green-600",
      warning: "text-yellow-600",
      danger: "text-red-600",
    },
    bold: {
      true: "font-bold",
    },
    italic: {
      true: "italic",
    },
  },
  defaultVariants: {
    variant: "body1",
    textColor: "default",
  },
});

export interface TypographyProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  children: ReactNode;
  as?: React.ElementType;
}

export function Typography({
  className,
  variant,
  textColor,
  bold,
  italic,
  as: Component = "p",
  children,
  ...props
}: Readonly<TypographyProps>) {
  return (
    <Component
      className={cn(
        typographyVariants({ variant, textColor, bold, italic, className })
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
