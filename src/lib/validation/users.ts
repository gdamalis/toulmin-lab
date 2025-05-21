import { Role } from "@/types/roles";
import { 
  ValidationResult, 
  combineValidators,
  validateNonEmptyString,
  validateRequired,
} from "./schema";
import { UserInput } from "@/types/users";

/**
 * Type for field error messages
 */
type FieldErrorMessages = {
  userId?: string;
  name?: string;
  email?: string;
  role?: string;
}

/**
 * Input for role update operations 
 */
export interface RoleUpdateInput {
  userId: string;
  role: Role;
}

/**
 * Extended UserInput with userId for validation
 */
interface UserInputWithId extends UserInput {
  userId: string;
}

/**
 * Validates user input for creation/update operations
 */
export function validateUserInput(body: unknown): ValidationResult {
  // Type guard for input validation
  const isUserInput = (data: unknown): data is UserInputWithId => {
    const input = data as Partial<UserInputWithId>;
    return typeof input === 'object' && 
           input !== null && 
           typeof input.userId === 'string' &&
           typeof input.name === 'string' &&
           typeof input.email === 'string';
  };
  
  // First verify it's a valid object with required fields
  if (!isUserInput(body)) {
    const fieldErrors: FieldErrorMessages = {};
    const unknownBody = body as Record<string, unknown>;
    
    if (typeof unknownBody?.userId !== 'string') fieldErrors.userId = "User ID must be a string";
    if (typeof unknownBody?.name !== 'string') fieldErrors.name = "Name must be a string";
    if (typeof unknownBody?.email !== 'string') fieldErrors.email = "Email must be a string";
    
    return { 
      isValid: false, 
      error: "Invalid user input format", 
      fieldErrors: fieldErrors as Record<string, string>
    };
  }
  
  // Then validate the content of the fields
  const validator = combineValidators<UserInputWithId & Record<string, unknown>>(
    validateNonEmptyString('userId'),
    validateNonEmptyString('name'),
    validateNonEmptyString('email')
  );
  
  return validator(body as UserInputWithId & Record<string, unknown>);
}

/**
 * Validates role update operations
 */
export function validateRoleUpdate(body: unknown): ValidationResult {
  // Type guard for role update input
  const isRoleUpdateInput = (data: unknown): data is RoleUpdateInput => {
    const input = data as Partial<RoleUpdateInput>;
    return typeof input === 'object' && 
           input !== null && 
           typeof input.userId === 'string' &&
           typeof input.role === 'string';
  };
  
  // First verify it's a valid object with required fields
  if (!isRoleUpdateInput(body)) {
    const fieldErrors: FieldErrorMessages = {};
    const unknownBody = body as Record<string, unknown>;
    
    if (typeof unknownBody?.userId !== 'string') fieldErrors.userId = "User ID must be a string";
    if (typeof unknownBody?.role !== 'string') fieldErrors.role = "Role must be a string";
    
    return { 
      isValid: false, 
      error: "Invalid role update format", 
      fieldErrors: fieldErrors as Record<string, string>
    };
  }
  
  // Then validate the required fields
  const baseValidator = combineValidators<RoleUpdateInput & Record<string, unknown>>(
    validateRequired('userId'),
    validateRequired('role')
  );
  
  const result = baseValidator(body as RoleUpdateInput & Record<string, unknown>);
  if (!result.isValid) {
    return result;
  }
  
  // Additional validation for role value
  if (!Object.values(Role).includes(body.role)) {
    return { 
      isValid: false, 
      error: "A valid role is required",
      fieldErrors: { role: "A valid role is required" }
    };
  }
  
  return { isValid: true };
} 