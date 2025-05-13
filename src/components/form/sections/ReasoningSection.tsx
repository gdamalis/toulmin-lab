"use client";

import { FormInput, FormSection } from "@/components/form";
import { ToulminArgument } from "@/types/client";
import { useTranslations } from "next-intl";
import { ChangeEvent } from "react";

interface ReasoningSectionProps {
  formData: ToulminArgument;
  errors: Record<string, string>;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (name: string) => void;
}

export function ReasoningSection({
  formData,
  errors,
  onChange,
  onBlur
}: Readonly<ReasoningSectionProps>) {
  const t = useTranslations("pages.argument");

  return (
    <FormSection
      title={t("reasoningSection")}
      description={t("reasoningSectionDescription")}
    >
      <FormInput
        inputComponent="textarea"
        id="warrant"
        name="warrant"
        label={t("warrant")}
        value={formData.parts.warrant}
        onChange={onChange}
        onBlur={() => onBlur("warrant")}
        placeholder={t("warrantPlaceholder")}
        required
        error={errors["warrant"]}
        ariaInvalid={!!errors["warrant"]}
        ariaDescribedby={errors["warrant"] ? "warrant-error" : undefined}
      />

      <FormInput
        inputComponent="textarea"
        id="warrantBacking"
        name="warrantBacking"
        label={t("backing")}
        value={formData.parts.warrantBacking}
        onChange={onChange}
        onBlur={() => onBlur("warrantBacking")}
        placeholder={t("backingPlaceholder")}
        required
        error={errors["warrantBacking"]}
        ariaInvalid={!!errors["warrantBacking"]}
        ariaDescribedby={errors["warrantBacking"] ? "warrantBacking-error" : undefined}
      />
    </FormSection>
  );
} 