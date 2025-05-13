"use client";

import { FormInput } from "@/components/form";
import { Divider } from "@/components/ui/Divider";
import { Typography } from "@/components/ui/Typography";
import { ToulminArgument } from "@/types/client";
import { useTranslations } from "next-intl";
import { ChangeEvent } from "react";

interface MetadataSectionProps {
  formData: ToulminArgument;
  errors: Record<string, string>;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (name: string) => void;
}

export function MetadataSection({
  formData,
  errors,
  onChange,
  onBlur
}: Readonly<MetadataSectionProps>) {
  const t = useTranslations("pages.argument");

  return (
    <Divider>
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h2" className="text-base/7 font-semibold">
            {t("diagramDetails")}
          </Typography>
          <Typography
            variant="body-sm"
            textColor="muted"
            className="mt-1 text-sm/6"
          >
            {t("basicInfoDescription")}
          </Typography>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <FormInput
          inputComponent="input"
          id="name"
          name="name"
          label={t("argumentName")}
          value={formData.name}
          onChange={onChange}
          onBlur={() => onBlur("name")}
          placeholder={t("argumentNamePlaceholder")}
          required
          error={errors["name"]}
          ariaInvalid={!!errors["name"]}
          ariaDescribedby={errors["name"] ? "name-error" : undefined}
        />

        <FormInput
          inputComponent="input"
          id="author"
          name="author"
          label={t("author")}
          value={formData.author.name}
          onChange={onChange}
          onBlur={() => onBlur("author")}
          placeholder={t("authorPlaceholder")}
          required
          error={errors["author"]}
          ariaInvalid={!!errors["author"]}
          ariaDescribedby={errors["author"] ? "author-error" : undefined}
        />
      </div>
    </Divider>
  );
} 