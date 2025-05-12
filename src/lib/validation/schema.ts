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
export type Validator<T> = (value: T) => ValidationResult;

/**
 * Combines multiple validators into a single validator
 */
export function combineValidators<T>(...validators: Validator<T>[]): Validator<T> {
  return (value: T) => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) return result;
    }
    return { isValid: true };
  };
}

/**
 * Type-safe field validator for any object type
 */
export function createFieldValidator<T extends Record<string, unknown>, K extends keyof T>(
  field: K,
  validationFn: (value: T[K]) => boolean,
  errorMessage: string
): Validator<T> {
  return (value: T) => {
    const fieldValue = value[field];
    
    if (!validationFn(fieldValue)) {
      return { 
        isValid: false, 
        error: errorMessage,
        fieldErrors: { [field as string]: errorMessage }
      };
    }
    
    return { isValid: true };
  };
}

/**
 * Validates that a field is a non-empty string
 */
export function validateNonEmptyString<T extends Record<string, unknown>>(
  field: keyof T & string
): Validator<T> {
  return createFieldValidator(
    field, 
    (value): boolean => 
      typeof value === 'string' && value.trim().length > 0,
    `${field} is required`
  );
}

/**
 * Validates that a field exists (not undefined or null)
 */
export function validateRequired<T extends Record<string, unknown>>(
  field: keyof T & string
): Validator<T> {
  return createFieldValidator(
    field,
    (value): boolean => value !== undefined && value !== null,
    `${field} is required`
  );
}

/**
 * Validates that a field matches a specific type
 */
export function validateType<T extends Record<string, unknown>>(
  field: keyof T & string, 
  type: string
): Validator<T> {
  return createFieldValidator(
    field,
    (value): boolean => typeof value === type,
    `${field} must be a ${type}`
  );
} 