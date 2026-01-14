import { z } from 'zod';
import { Role } from '@/types/roles';

/**
 * Zod schema for user input with ID (for updates)
 */
export const UserInputSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1).max(200),
  email: z.string().email(),
});

/**
 * Zod schema for user creation request
 */
export const CreateUserRequestSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8).max(128).optional(),
  role: z.nativeEnum(Role).optional(),
  picture: z.string().url().optional(),
});

/**
 * Zod schema for role update operations
 */
export const RoleUpdateSchema = z.object({
  userId: z.string().min(1),
  role: z.nativeEnum(Role),
});

/**
 * Validate user input for creation/update operations
 */
export function validateUserInput(data: unknown) {
  return UserInputSchema.safeParse(data);
}

/**
 * Validate user creation request
 */
export function validateCreateUser(data: unknown) {
  return CreateUserRequestSchema.safeParse(data);
}

/**
 * Validate role update operations
 */
export function validateRoleUpdate(data: unknown) {
  return RoleUpdateSchema.safeParse(data);
}

/**
 * Input for role update operations 
 */
export interface RoleUpdateInput {
  userId: string;
  role: Role;
}
