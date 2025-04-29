"use client";

import { FormSectionProps } from "./types";
import { Typography } from "@/components/ui/Typography";
import { Divider } from "@/components/ui/Divider";

export function FormSection({ title, description, children }: Readonly<FormSectionProps>) {
  return (
    <Divider>
      <Typography variant="h2" className="text-base/7 font-semibold">
        {title}
      </Typography>
      <Typography variant="body-sm" textColor="muted" className="mt-1 text-sm/6">
        {description}
      </Typography>
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        {children}
      </div>
    </Divider>
  );
} 