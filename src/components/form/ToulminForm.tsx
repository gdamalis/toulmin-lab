"use client";

import { FormActions } from "@/components/form/FormActions";
import { FormSubmit } from "@/components/form/FormSubmit";
import { FormInput } from "@/components/form";
import { 
  ArgumentStructureSection,
  LimitationsSection,
  ReasoningSection 
} from "@/components/form/sections";
import { useIsOnline } from "@/hooks";
import { 
  useDebounce,
  useFormPersistence,
  useFormValidation 
} from "@/hooks/form";
import { ToulminFormProps } from "@/components/form/types";
import { ToulminArgument } from "@/types/client";
import { 
  emptyToulminArgument,
  sampleToulminArgument,
  sampleToulminArgumentES 
} from "@/data/toulminTemplates";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale, useTranslations } from "next-intl";
import { ChangeEvent, useEffect, useState } from "react";
import { Typography } from "@/components/ui/Typography";
import { Divider } from "@/components/ui/Divider";

const STORAGE_KEY = "toulmin-form-draft";

export function ToulminForm({
  onSubmit,
  onChange,
  initialData = emptyToulminArgument,
}: Readonly<ToulminFormProps>) {
  const locale = useLocale();
  const t = useTranslations("pages.argument");
  const { user } = useAuth();
  const isOnline = useIsOnline();
  const [formData, setFormData] = useState<ToulminArgument>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [showValidation, setShowValidation] = useState(false);

  // Initialize form persistence utilities
  const { loadSavedData, saveData, clearSavedData } = useFormPersistence<ToulminArgument>(
    STORAGE_KEY,
    initialData
  );

  // Get form validation
  const { errors, validateForm } = useFormValidation(
    formData, 
    touchedFields, 
    showValidation
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

    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

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

  const handleBlur = (name: string) => {
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setShowValidation(true);
    
    // Check if form is valid before submission
    if (!validateForm) {
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
    <form className="p-2" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-8">
        {/* Title input (large, prominent at the top) */}
        <div className="mb-2">
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={() => handleBlur("name")}
            placeholder={t("argumentNamePlaceholder")}
            className={`w-full text-2xl font-semibold border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-primary-600 outline-none py-2 px-1 ${errors["name"] ? "border-red-500" : ""}`}
            aria-required="true"
            aria-invalid={!!errors["name"]}
            aria-describedby={errors["name"] ? "name-error" : undefined}
          />
          {errors["name"] && (
            <p id="name-error" className="mt-1 text-sm text-red-600">
              {errors["name"]}
            </p>
          )}
        </div>
        
        {/* Form actions moved below the title */}
        <FormActions
          onSampleData={handleSampleData}
          onClearForm={handleClearForm}
          lastSaved={lastSaved}
          isOnline={isOnline}
          isUserSignedIn={!!user}
        />

        {/* Author field (moved from MetadataSection) */}
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
              id="author"
              name="author"
              label={t("author")}
              value={formData.author.name}
              onChange={handleInputChange}
              onBlur={() => handleBlur("author")}
              placeholder={t("authorPlaceholder")}
              required
              error={errors["author"]}
              ariaInvalid={!!errors["author"]}
              ariaDescribedby={errors["author"] ? "author-error" : undefined}
            />
          </div>
        </Divider>

        <ArgumentStructureSection
          formData={formData}
          errors={errors}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />

        <ReasoningSection
          formData={formData}
          errors={errors}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />

        <LimitationsSection
          formData={formData}
          errors={errors}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
      </div>

      <FormSubmit
        isSubmitting={isSubmitting}
        isOnline={isOnline}
      />
    </form>
  );
} 