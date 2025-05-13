"use client";

import { FormActions } from "@/components/form/FormActions";
import { FormSubmit } from "@/components/form/FormSubmit";
import { 
  ArgumentStructureSection,
  LimitationsSection,
  MetadataSection,
  ReasoningSection 
} from "@/components/form/sections";
import { useIsOnline } from "@/hooks/useIsOnline";
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
import { useLocale } from "next-intl";
import { ChangeEvent, useEffect, useState } from "react";

const STORAGE_KEY = "toulmin-form-draft";

export function ToulminForm({
  onSubmit,
  onChange,
  initialData = emptyToulminArgument,
}: Readonly<ToulminFormProps>) {
  const locale = useLocale();
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
        <FormActions
          onSampleData={handleSampleData}
          onClearForm={handleClearForm}
          lastSaved={lastSaved}
          isOnline={isOnline}
        />

        <MetadataSection
          formData={formData}
          errors={errors}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />

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