import { ToulminArgument } from "@/types/client";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

/**
 * Hook for validating ToulminArgument form data
 */
export function useFormValidation(
  formData: ToulminArgument,
  touchedFields: Record<string, boolean>,
  showValidation: boolean
) {
  const t = useTranslations("pages.argument");

  // Get validation errors for fields
  const errors = useMemo(() => {
    const fieldErrors: Record<string, string> = {};
    
    // Validate required metadata fields
    if (showValidation || touchedFields["name"]) {
      if (!formData.name.trim()) fieldErrors["name"] = t("validation.required");
    }
    
    if (showValidation || touchedFields["author"]) {
      if (!formData.author.name.trim()) fieldErrors["author"] = t("validation.required");
    }
    
    // Validate required diagram parts
    const partFields = [
      "claim", "grounds", "groundsBacking", 
      "warrant", "warrantBacking", 
      "qualifier", "rebuttal"
    ];
    
    partFields.forEach(field => {
      if (showValidation || touchedFields[field]) {
        if (!formData.parts[field as keyof typeof formData.parts].trim()) {
          fieldErrors[field] = t("validation.required");
        }
      }
    });
    
    return fieldErrors;
  }, [formData, touchedFields, showValidation, t]);

  // Validate the entire form
  const validateForm = useMemo(() => {
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
  }, [formData]);

  return { 
    errors,
    validateForm
  };
} 