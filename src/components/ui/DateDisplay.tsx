"use client";

import { Typography } from "./Typography";
import { format } from "date-fns";

interface DateDisplayProps {
  date: string | Date;
  label?: string;
  className?: string;
}

export function DateDisplay({ date, label, className }: Readonly<DateDisplayProps>) {
  const formatDate = (dateInput: string | Date) => {
    try {
      return format(new Date(dateInput), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Typography variant="body-sm" textColor="muted" className={className}>
      {label && <>{label}{" "}</>}
      <time dateTime={date instanceof Date ? date.toISOString() : date.toString()}>
        {formatDate(date)}
      </time>
    </Typography>
  );
} 