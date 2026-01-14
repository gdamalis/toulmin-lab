import { z } from 'zod';

/**
 * Zod schema for Toulmin argument parts
 */
export const ToulminArgumentPartSchema = z.object({
  claim: z.string().max(2000),
  grounds: z.string().max(2000),
  groundsBacking: z.string().max(2000),
  warrant: z.string().max(2000),
  warrantBacking: z.string().max(2000),
  qualifier: z.string().max(2000),
  rebuttal: z.string().max(2000),
});

/**
 * Zod schema for author info
 */
export const AuthorSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
});

/**
 * Zod schema for ToulminArgumentInput (without author - server sets it)
 */
export const ToulminArgumentInputSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1).max(200),
  parts: ToulminArgumentPartSchema,
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
});

/**
 * Zod schema for ToulminArgument (with author)
 */
export const ToulminArgumentSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1).max(200),
  author: AuthorSchema,
  parts: ToulminArgumentPartSchema,
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
});

/**
 * Zod schema for argument creation request body
 */
export const CreateArgumentRequestSchema = z.object({
  diagram: ToulminArgumentInputSchema, // Use input schema without author
});

/**
 * Validate argument creation request
 */
export function validateCreateArgument(data: unknown) {
  return CreateArgumentRequestSchema.safeParse(data);
}

/**
 * Validate argument update request
 */
export function validateUpdateArgument(data: unknown) {
  return ToulminArgumentSchema.safeParse(data);
}
