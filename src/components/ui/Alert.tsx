import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Typography } from "./Typography";

interface AlertProps {
  className?: string;
  children?: ReactNode;
  variant?: "default" | "destructive" | "warning" | "success";
  title?: string;
  description?: string;
  icon?: ReactNode;
  onDismiss?: () => void;
}

interface AlertTitleProps {
  className?: string;
  children: ReactNode;
}

interface AlertDescriptionProps {
  className?: string;
  children: ReactNode;
}

const Alert = ({
  className,
  variant = "default",
  children,
  title,
  description,
  icon,
  onDismiss,
  ...props
}: AlertProps) => {
  // Variant-based styles
  const variantStyles = {
    default: {
      bg: "bg-blue-50",
      textTitle: "text-blue-800",
      textDescription: "text-blue-700",
      icon: "text-blue-400",
      iconBg: "bg-blue-50",
      hover: "hover:bg-blue-100",
      ring: "focus:ring-blue-600",
      ringOffset: "focus:ring-offset-blue-50",
      button: "text-blue-500",
    },
    destructive: {
      bg: "bg-red-50",
      textTitle: "text-red-800",
      textDescription: "text-red-700",
      icon: "text-red-400",
      iconBg: "bg-red-50",
      hover: "hover:bg-red-100",
      ring: "focus:ring-red-600",
      ringOffset: "focus:ring-offset-red-50",
      button: "text-red-500",
    },
    warning: {
      bg: "bg-amber-50",
      textTitle: "text-amber-800",
      textDescription: "text-amber-700",
      icon: "text-amber-400",
      iconBg: "bg-amber-50",
      hover: "hover:bg-amber-100",
      ring: "focus:ring-amber-600",
      ringOffset: "focus:ring-offset-amber-50",
      button: "text-amber-500",
    },
    success: {
      bg: "bg-green-50",
      textTitle: "text-green-800",
      textDescription: "text-green-700",
      icon: "text-green-400",
      iconBg: "bg-green-50",
      hover: "hover:bg-green-100",
      ring: "focus:ring-green-600",
      ringOffset: "focus:ring-offset-green-50",
      button: "text-green-500",
    },
  };

  // Default icons based on variant
  const defaultIcon = {
    default: <InformationCircleIcon aria-hidden="true" className="size-6" />,
    destructive: (
      <ExclamationTriangleIcon aria-hidden="true" className="size-6" />
    ),
    warning: <ExclamationTriangleIcon aria-hidden="true" className="size-6" />,
    success: <CheckCircleIcon aria-hidden="true" className="size-6" />,
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn("rounded-md p-4", styles.bg, className)} {...props}>
      <div className="flex">
        {/* Icon */}
        {(icon || defaultIcon[variant]) && (
          <div className="shrink-0">
            <div className={styles.icon}>{icon || defaultIcon[variant]}</div>
          </div>
        )}

        {/* Content */}
        <div className={cn("ml-3 flex flex-col gap-5")}>
          {title && (
            <Typography variant="body1" className={cn(styles.textTitle)}>
              {title}
            </Typography>
          )}
          <div className={cn("flex flex-col gap-1", styles.textDescription)}>
            {description && (
              <Typography variant="body-sm" textColor="inherit">
                {description}
              </Typography>
            )}
            {children}
          </div>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={cn(
                  "inline-flex rounded-md p-1.5",
                  styles.bg,
                  styles.button,
                  styles.hover,
                  "focus:ring-2",
                  styles.ring,
                  styles.ringOffset,
                  "focus:ring-offset-2",
                  "focus:outline-hidden"
                )}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AlertTitle = ({ className, children, ...props }: AlertTitleProps) => {
  return (
    <p className={cn("text-sm font-medium", className)} {...props}>
      {children}
    </p>
  );
};

const AlertDescription = ({
  className,
  children,
  ...props
}: AlertDescriptionProps) => {
  return (
    <p className={cn("text-sm mt-1", className)} {...props}>
      {children}
    </p>
  );
};

export { Alert, AlertTitle, AlertDescription };
