import { Role } from "@/types/roles";
import { 
  ValidationResult, 
  combineValidators,
  validateNonEmptyString,
  validateRequired,
} from "./schema";

/**
 * Input for role update operations
 */
export interface RoleUpdateInput {
  userId: string;
  role: Role;
}

/**
 * Validates user input for creation/update operations
 */
export function validateUserInput(body: unknown): ValidationResult {
  const validator = combineValidators(
    validateNonEmptyString('userId'),
    validateNonEmptyString('name'),
    validateNonEmptyString('email')
  );
  
  return validator(body);
}

/**
 * Validates role update operations
 */
export function validateRoleUpdate(body: unknown): ValidationResult {
  const baseValidator = combineValidators(
    validateRequired('userId'),
    validateRequired('role')
  );
  
  const result = baseValidator(body);
  if (!result.isValid) {
    return result;
  }
  
  // Additional validation for role value
  const input = body as Partial<RoleUpdateInput>;
  if (!input.role || !Object.values(Role).includes(input.role)) {
    return { 
      isValid: false, 
      error: "A valid role is required",
      fieldErrors: { role: "A valid role is required" }
    };
  }
  
  return { isValid: true };
} 