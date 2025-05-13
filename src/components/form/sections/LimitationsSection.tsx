"use client";

import { FormInput, FormSection } from "@/components/form";
import { ToulminArgument } from "@/types/client";
import { useTranslations } from "next-intl";
import { ChangeEvent } from "react";

interface LimitationsSectionProps {
  formData: ToulminArgument;
  errors: Record<string, string>;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (name: string) => void;
}

export function LimitationsSection({
  formData,
  errors,
  onChange,
  onBlur
}: Readonly<LimitationsSectionProps>) {
  const t = useTranslations("pages.argument");

  return (
    <FormSection
      title={t("limitationsSection")}
      description={t("limitationsSectionDescription")}
    >
      <FormInput
        inputComponent="textarea"
        id="qualifier"
        name="qualifier"
        label={t("qualifier")}
        value={formData.parts.qualifier}
        onChange={onChange}
        onBlur={() => onBlur("qualifier")}
        placeholder={t("qualifierPlaceholder")}
        rows={3}
        className="sm:col-span-3"
        required
        error={errors["qualifier"]}
        ariaInvalid={!!errors["qualifier"]}
        ariaDescribedby={errors["qualifier"] ? "qualifier-error" : undefined}
      />

      <FormInput
        inputComponent="textarea"
        id="rebuttal"
        name="rebuttal"
        label={t("rebuttal")}
        value={formData.parts.rebuttal}
        onChange={onChange}
        onBlur={() => onBlur("rebuttal")}
        placeholder={t("rebuttalPlaceholder")}
        rows={3}
        className="sm:col-span-3"
        required
        error={errors["rebuttal"]}
        ariaInvalid={!!errors["rebuttal"]}
        ariaDescribedby={errors["rebuttal"] ? "rebuttal-error" : undefined}
      />
    </FormSection>
  );
} 