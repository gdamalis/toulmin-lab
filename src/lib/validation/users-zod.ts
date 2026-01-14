import { z } from 'zod';
import { Role } from '@/types/roles';

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
 * Validate user creation request
 */
export function validateCreateUser(data: unknown) {
  return CreateUserRequestSchema.safeParse(data);
}
