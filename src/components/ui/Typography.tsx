import React from "react";
import { cn } from "@/lib/utils";

export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body-lg"
  | "body"
  | "body-sm"
  | "caption"
  | "overline";

export type TypographyElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div";

interface TypographyProps {
  readonly variant?: TypographyVariant;
  readonly as?: TypographyElement;
  readonly bold?: boolean;
  readonly italic?: boolean;
  readonly className?: string;
  readonly children: React.ReactNode;
  readonly id?: string;
}

export function Typography({
  variant = "body",
  as,
  bold,
  italic,
  className,
  children,
  id,
  ...props
}: TypographyProps) {
  const Component = as ?? mapVariantToElement(variant);

  return (
    <Component
      id={id}
      className={cn(
        getVariantStyles(variant),
        bold && "font-bold",
        italic && "italic",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

function mapVariantToElement(variant: TypographyVariant): TypographyElement {
  // Map heading variants to their corresponding HTML elements
  if (
    variant.startsWith("h") &&
    ["1", "2", "3", "4", "5", "6"].includes(variant[1])
  ) {
    return variant as TypographyElement;
  }

  // All other variants default to paragraph
  return "p";
}

function getVariantStyles(variant: TypographyVariant): string {
  const styles = {
    h1: "text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white",
    h2: "text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white",
    h3: "text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white",
    h4: "text-xl md:text-2xl font-semibold text-gray-900 dark:text-white",
    h5: "text-lg md:text-xl font-medium text-gray-900 dark:text-white",
    h6: "text-base md:text-lg font-medium text-gray-900 dark:text-white",
    "body-lg": "text-lg leading-7 text-gray-700 dark:text-gray-300",
    body: "text-base leading-7 text-gray-700 dark:text-gray-300",
    "body-sm": "text-sm leading-6 text-gray-700 dark:text-gray-300",
    caption: "text-sm text-gray-500 dark:text-gray-400",
    overline:
      "text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium",
  };

  return styles[variant];
}
