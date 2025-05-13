"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useTranslations } from "next-intl";

interface FormSubmitProps {
  isSubmitting: boolean;
  isOnline: boolean;
}

export function FormSubmit({
  isSubmitting,
  isOnline,
}: Readonly<FormSubmitProps>) {
  const commonT = useTranslations("common");

  return (
    <div className="mt-6 flex items-center justify-end gap-x-6">
      {!isOnline && (
        <Typography variant="body-sm" textColor="warning" className="mr-auto">
          {commonT("offlineWarning")}
        </Typography>
      )}
      <Button type="submit" isLoading={isSubmitting} disabled={!isOnline}>
        {commonT("save")}
      </Button>
    </div>
  );
} 