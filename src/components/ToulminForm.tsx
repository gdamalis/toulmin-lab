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
import { useIsOnline } from "../hooks/useIsOnline";
import { ToulminArgument } from "@/types/client";
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { useLocale, useTranslations } from "next-intl";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "toulmin-form-draft";

// Custom hook for form persistence
function useFormPersistence(key: string, initialValue: ToulminArgument) {
  // Load data from localStorage if available
  const loadSavedData = useCallback(() => {
    if (typeof window === "undefined") return initialValue;
    
    try {
      const savedItem = localStorage.getItem(key);
      if (savedItem) {
        return JSON.parse(savedItem) as ToulminArgument;
      }
    } catch (error) {
      console.error("Failed to load saved form data:", error);
    }
    return initialValue;
  }, [key, initialValue]);

  // Save data to localStorage
  const saveData = useCallback((data: ToulminArgument) => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save form data:", error);
    }
  }, [key]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to clear saved form data:", error);
    }
  }, [key]);

  return { loadSavedData, saveData, clearSavedData };
}

// Debounce helper function for ToulminArgument changes
function useDebounce(
  callback: (data: ToulminArgument) => void,
  delay: number
) {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedFn = useCallback(
    (data: ToulminArgument) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      const id = setTimeout(() => {
        callback(data);
      }, delay);
      
      setTimeoutId(id);
    },
    [callback, delay, timeoutId]
  );

  return debouncedFn;
}

export function ToulminForm({
  onSubmit,
  onChange,
  initialData = emptyToulminArgument,
}: Readonly<ToulminFormProps>) {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");
  const locale = useLocale();
  const { user } = useAuth();
  const isOnline = useIsOnline();
  const [formData, setFormData] = useState<ToulminArgument>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize form persistence utilities
  const { loadSavedData, saveData, clearSavedData } = useFormPersistence(
    STORAGE_KEY,
    initialData
  );

  // Create debounced save function
  const debouncedSave = useDebounce((data: ToulminArgument) => {
    saveData(data);
    setLastSaved(new Date());
  }, 1000);

  // Get the appropriate sample data based on the current locale
  const getSampleData = () => {
    return locale === "es" ? sampleToulminArgumentES : sampleToulminArgument;
  };

  // Initialize form with saved data or initialData
  useEffect(() => {
    // Only run on mount or when initialData/loadSavedData changes
    // Priority: initialData (if not empty) > saved data
    if (JSON.stringify(initialData) !== JSON.stringify(emptyToulminArgument)) {
      setFormData(initialData);
    } else {
      const savedData = loadSavedData();
      setFormData(savedData);
    }
  }, [initialData, loadSavedData]);

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
      debouncedSave(updatedData);
    }
  }, [user, formData, onChange, debouncedSave]);

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
    // Auto-save to localStorage
    debouncedSave(updatedData);
  };

  const validateForm = (): boolean => {
    return (
      !!formData.name.trim() &&
      !!formData.author.name.trim() &&
      !!formData.parts.claim.trim() &&
      !!formData.parts.grounds.trim() &&
      !!formData.parts.warrant.trim() &&
      !!formData.parts.qualifier.trim() &&
      !!formData.parts.groundsBacking.trim() &&
      !!formData.parts.warrantBacking.trim() &&
      !!formData.parts.rebuttal.trim()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Clear saved draft after successful submission
      clearSavedData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSampleData = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sampleData = getSampleData();
    setFormData(sampleData);
    onChange?.(sampleData);
    debouncedSave(sampleData);
  };

  const handleClearForm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const emptyData = emptyToulminArgument;
    setFormData(emptyData);
    onChange?.(emptyData);
    // Clear from localStorage
    clearSavedData();
    setLastSaved(null);
  };

  return (
    <form className="p-2" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSampleData}
              title={t("loadSampleTooltip")}
            >
              <DocumentDuplicateIcon className="w-4 h-4 mr-1.5" />
              <span>{t("useSample")}</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClearForm}
            >
              <ArrowPathIcon className="w-4 h-4 mr-1.5" />
              <span>{commonT("clear")}</span>
            </Button>
          </div>
          
          {lastSaved && (
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <CloudArrowUpIcon className="w-4 h-4 mr-1" />
              <span>
                {isOnline 
                  ? commonT("lastSaved", { 
                      time: lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    })
                  : commonT("offlineDraftSaved")}
              </span>
            </div>
          )}
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
            required
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
            required
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
            required
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
            required
          />
        </FormSection>
      </div>

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
    </form>
  );
}
