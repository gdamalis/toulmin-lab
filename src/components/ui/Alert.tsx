import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AlertProps {
  className?: string;
  children: ReactNode;
  variant?: "default" | "destructive" | "warning" | "success";
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
  ...props
}: AlertProps) => {
  const variantStyles = {
    default: "bg-blue-50 border-blue-200 text-blue-800",
    destructive: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };

  return (
    <div
      className={cn(
        "flex gap-3 rounded-md border p-4",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const AlertTitle = ({ className, children, ...props }: AlertTitleProps) => {
  return (
    <h5
      className={cn("font-medium leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h5>
  );
};

const AlertDescription = ({
  className,
  children,
  ...props
}: AlertDescriptionProps) => {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export { Alert, AlertTitle, AlertDescription }; 