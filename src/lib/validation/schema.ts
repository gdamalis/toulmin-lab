/**
 * Result of a validation operation
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Type for validation functions
 */
export type Validator<T = unknown> = (value: unknown) => ValidationResult;

/**
 * Combines multiple validators into a single validator
 */
export function combineValidators(...validators: Validator[]): Validator {
  return (value: unknown) => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) return result;
    }
    return { isValid: true };
  };
}

/**
 * Validates that a value is a non-empty string
 */
export function validateNonEmptyString(field: string): Validator {
  return (value: unknown) => {
    const record = value as Record<string, unknown>;
    const fieldValue = record[field];
    
    if (!fieldValue || typeof fieldValue !== "string" || !fieldValue.trim()) {
      return { 
        isValid: false, 
        error: `${field} is required`,
        fieldErrors: { [field]: `${field} is required` }
      };
    }
    
    return { isValid: true };
  };
}

/**
 * Validates that a field exists
 */
export function validateRequired(field: string): Validator {
  return (value: unknown) => {
    const record = value as Record<string, unknown>;
    const fieldValue = record[field];
    
    if (fieldValue === undefined || fieldValue === null) {
      return { 
        isValid: false, 
        error: `${field} is required`,
        fieldErrors: { [field]: `${field} is required` }
      };
    }
    
    return { isValid: true };
  };
}

/**
 * Validates that a value matches a given type
 */
export function validateType(field: string, type: string): Validator {
  return (value: unknown) => {
    const record = value as Record<string, unknown>;
    const fieldValue = record[field];
    
    if (typeof fieldValue !== type) {
      return { 
        isValid: false, 
        error: `${field} must be a ${type}`,
        fieldErrors: { [field]: `${field} must be a ${type}` }
      };
    }
    
    return { isValid: true };
  };
} 