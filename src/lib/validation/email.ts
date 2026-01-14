import { z } from 'zod';

/**
 * Zod schema for email sending request
 */
export const SendEmailRequestSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  inviterName: z.string().min(1).max(200),
  userRole: z.string().min(1).max(50),
  temporaryPassword: z.string().nullable().optional(),
  locale: z.string().min(2).max(5).optional().default('en'),
});

/**
 * Validate email send request
 */
export function validateSendEmail(data: unknown) {
  return SendEmailRequestSchema.safeParse(data);
}
