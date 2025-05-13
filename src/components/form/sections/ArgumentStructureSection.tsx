"use client";

import { FormInput, FormSection } from "@/components/form";
import { ToulminArgument } from "@/types/client";
import { useTranslations } from "next-intl";
import { ChangeEvent } from "react";

interface ArgumentStructureSectionProps {
  formData: ToulminArgument;
  errors: Record<string, string>;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (name: string) => void;
}

export function ArgumentStructureSection({
  formData,
  errors,
  onChange,
  onBlur
}: Readonly<ArgumentStructureSectionProps>) {
  const t = useTranslations("pages.argument");

  return (
    <FormSection
      title={t("argumentStructure")}
      description={t("argumentStructureDescription")}
    >
      <FormInput
        inputComponent="textarea"
        id="claim"
        name="claim"
        label={t("claim")}
        value={formData.parts.claim}
        onChange={onChange}
        onBlur={() => onBlur("claim")}
        placeholder={t("claimPlaceholder")}
        required
        error={errors["claim"]}
        ariaInvalid={!!errors["claim"]}
        ariaDescribedby={errors["claim"] ? "claim-error" : undefined}
      />

      <FormInput
        inputComponent="textarea"
        id="grounds"
        name="grounds"
        label={t("evidence")}
        value={formData.parts.grounds}
        onChange={onChange}
        onBlur={() => onBlur("grounds")}
        placeholder={t("evidencePlaceholder")}
        required
        error={errors["grounds"]}
        ariaInvalid={!!errors["grounds"]}
        ariaDescribedby={errors["grounds"] ? "grounds-error" : undefined}
      />

      <FormInput
        inputComponent="textarea"
        id="groundsBacking"
        name="groundsBacking"
        label={t("evidenceBacking")}
        value={formData.parts.groundsBacking}
        onChange={onChange}
        onBlur={() => onBlur("groundsBacking")}
        placeholder={t("evidenceBackingPlaceholder")}
        required
        error={errors["groundsBacking"]}
        ariaInvalid={!!errors["groundsBacking"]}
        ariaDescribedby={errors["groundsBacking"] ? "groundsBacking-error" : undefined}
      />
    </FormSection>
  );
} 