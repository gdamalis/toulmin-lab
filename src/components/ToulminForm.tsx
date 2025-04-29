"use client";

import { FormInput, FormSection, ToulminFormProps } from "@/components/form";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import {
  emptyToulminArgument,
  sampleToulminArgument,
  sampleToulminArgumentES,
} from "@/data/toulminTemplates";
import { ToulminArgument } from "@/types/client";
import {
  ArrowPathIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { useLocale, useTranslations } from "next-intl";
import { ChangeEvent, useEffect, useState } from "react";

export function ToulminForm({
  onSubmit,
  onChange,
  initialData = emptyToulminArgument,
}: Readonly<ToulminFormProps>) {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");
  const locale = useLocale();
  const { user } = useAuth();
  const [formData, setFormData] = useState<ToulminArgument>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the appropriate sample data based on the current locale
  const getSampleData = () => {
    return locale === "es" ? sampleToulminArgumentES : sampleToulminArgument;
  };

  // Update form data if initialData changes externally
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Autopopulate author field with user's name when user data is available
  useEffect(() => {
    if (user && formData.author.name === "") {
      // Get user's display name or use email if name not available
      const userName = user.displayName ?? user.email?.split("@")[0] ?? "";
      const updatedData = {
        ...formData,
        author: {
          ...formData.author,
          name: userName,
          userId: user.uid,
        },
      };
      setFormData(updatedData);
      onChange?.(updatedData);
    }
  }, [user, formData.author.name, onChange]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let updatedData: ToulminArgument;

    if (name === "name") {
      updatedData = { ...formData, name: value };
    } else if (name === "author") {
      updatedData = {
        ...formData,
        author: {
          ...formData.author,
          name: value,
        },
      };
    } else {
      // Handle parts structure
      updatedData = {
        ...formData,
        parts: {
          ...formData.parts,
          [name]: value,
        },
      };
    }

    setFormData(updatedData);
    // Call onChange handler if provided to update parent's state
    onChange?.(updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="p-2" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-8">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const sampleData = getSampleData();
              setFormData(sampleData);
              onChange?.(sampleData);
            }}
            title={t("loadSampleTooltip")}
          >
            <DocumentDuplicateIcon className="w-4 h-4 mr-1.5" />
            <span>{t("useSample")}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const emptyData = emptyToulminArgument;
              setFormData(emptyData);
              onChange?.(emptyData);
            }}
          >
            <ArrowPathIcon className="w-4 h-4 mr-1.5" />
            <span>{commonT("clear")}</span>
          </Button>
        </div>

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
              onChange={handleInputChange}
              placeholder={t("argumentNamePlaceholder")}
              required
            />

            <FormInput
              inputComponent="input"
              id="author"
              name="author"
              label={t("author")}
              value={formData.author.name}
              onChange={handleInputChange}
              placeholder={t("authorPlaceholder")}
              required
            />
          </div>
        </Divider>

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
            onChange={handleInputChange}
            placeholder={t("claimPlaceholder")}
            required
          />

          <FormInput
            inputComponent="textarea"
            id="grounds"
            name="grounds"
            label={t("evidence")}
            value={formData.parts.grounds}
            onChange={handleInputChange}
            placeholder={t("evidencePlaceholder")}
            required
          />

          <FormInput
            inputComponent="textarea"
            id="groundsBacking"
            name="groundsBacking"
            label={t("evidenceBacking")}
            value={formData.parts.groundsBacking}
            onChange={handleInputChange}
            placeholder={t("evidenceBackingPlaceholder")}
          />
        </FormSection>

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
            onChange={handleInputChange}
            placeholder={t("warrantPlaceholder")}
            required
          />

          <FormInput
            inputComponent="textarea"
            id="warrantBacking"
            name="warrantBacking"
            label={t("backing")}
            value={formData.parts.warrantBacking}
            onChange={handleInputChange}
            placeholder={t("backingPlaceholder")}
          />
        </FormSection>

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
            onChange={handleInputChange}
            placeholder={t("qualifierPlaceholder")}
            rows={3}
            className="sm:col-span-3"
          />

          <FormInput
            inputComponent="textarea"
            id="rebuttal"
            name="rebuttal"
            label={t("rebuttal")}
            value={formData.parts.rebuttal}
            onChange={handleInputChange}
            placeholder={t("rebuttalPlaceholder")}
            rows={3}
            className="sm:col-span-3"
          />
        </FormSection>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button type="submit" isLoading={isSubmitting}>
          {commonT("save")}
        </Button>
      </div>
    </form>
  );
}
