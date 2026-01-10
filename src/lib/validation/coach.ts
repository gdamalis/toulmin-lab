import { z } from 'zod';
import { TOULMIN_STEPS, TOULMIN_STEP_ORDER, getNextStep } from '@/types/coach';

/**
 * Zod schema for ToulminStep
 */
export const ToulminStepSchema = z.enum([
  TOULMIN_STEPS.CLAIM,
  TOULMIN_STEPS.GROUNDS,
  TOULMIN_STEPS.WARRANT,
  TOULMIN_STEPS.GROUNDS_BACKING,
  TOULMIN_STEPS.WARRANT_BACKING,
  TOULMIN_STEPS.QUALIFIER,
  TOULMIN_STEPS.REBUTTAL,
]);

/**
 * Zod schema for ProposedUpdate
 */
export const ProposedUpdateSchema = z.object({
  field: ToulminStepSchema,
  value: z.string().min(1).max(2000),
  rationale: z.string().min(1).max(500),
});

/**
 * Zod schema for CoachAIResult - the structured output from AI
 */
export const CoachAIResultSchema = z.object({
  assistantText: z.string().describe('The tutor response message to display to the user'),
  step: ToulminStepSchema.describe('The current step being worked on'),
  confidence: z.number().min(0).max(1).optional().describe('Confidence score 0-1 for the current step completion'),
  proposedUpdate: ProposedUpdateSchema.optional().describe('Proposed text for the current Toulmin field'),
  nextQuestion: z.string().optional().describe('A guiding question to help the user'),
  shouldAdvance: z.boolean().optional().describe('Whether to advance to the next step'),
  nextStep: ToulminStepSchema.optional().describe('The next step to advance to (required when shouldAdvance=true)'),
  isComplete: z.boolean().optional().describe('Whether the entire argument is complete'),
}).superRefine((data, ctx) => {
  // Note: confidence is now optional even when proposedUpdate is present
  // Coercion layer will handle first-attempt gating based on confidence presence/absence

  // When shouldAdvance=true, nextStep is required and must be the correct next step
  if (data.shouldAdvance) {
    // On rebuttal (last step), shouldAdvance should not be true; use isComplete instead
    if (data.step === TOULMIN_STEPS.REBUTTAL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cannot advance from rebuttal; use isComplete=true instead',
        path: ['shouldAdvance'],
      });
      return;
    }

    if (!data.nextStep) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'nextStep is required when shouldAdvance=true',
        path: ['nextStep'],
      });
      return;
    }

    const expectedNext = getNextStep(data.step);
    if (data.nextStep !== expectedNext) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `nextStep must be '${expectedNext}' when advancing from '${data.step}'`,
        path: ['nextStep'],
      });
    }
  }
});

/**
 * Lenient version of CoachAIResultSchema for streaming
 * Does not enforce step-specific validation rules (e.g., no shouldAdvance on rebuttal)
 * Use this for AI streaming, then apply coercion and validate with CoachAIResultSchema
 */
export const CoachAIResultStreamSchema = z.object({
  assistantText: z.string().describe('The tutor response message to display to the user'),
  step: ToulminStepSchema.describe('The current step being worked on'),
  confidence: z.number().min(0).max(1).optional().describe('Confidence score 0-1 for the current step completion'),
  proposedUpdate: ProposedUpdateSchema.optional().describe('Proposed text for the current Toulmin field'),
  nextQuestion: z.string().optional().describe('A guiding question to help the user'),
  shouldAdvance: z.boolean().optional().describe('Whether to advance to the next step'),
  nextStep: ToulminStepSchema.optional().describe('The next step to advance to (required when shouldAdvance=true)'),
  isComplete: z.boolean().optional().describe('Whether the entire argument is complete'),
});

/**
 * Zod schema for chat API request
 */
export const CoachChatRequestSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(5000),
});

/**
 * Zod schema for draft update request
 */
export const DraftUpdateRequestSchema = z.object({
  sessionId: z.string().min(1),
  field: ToulminStepSchema,
  value: z.string().max(2000),
  version: z.number().int().min(0),
});

/**
 * Zod schema for session creation
 */
export const CreateSessionRequestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
});

/**
 * Zod schema for loading a session
 */
export const LoadSessionRequestSchema = z.object({
  sessionId: z.string().min(1),
});

/**
 * Validate chat request
 */
export function validateChatRequest(data: unknown) {
  return CoachChatRequestSchema.safeParse(data);
}

/**
 * Validate draft update request
 */
export function validateDraftUpdate(data: unknown) {
  return DraftUpdateRequestSchema.safeParse(data);
}

/**
 * Validate session creation request
 */
export function validateCreateSession(data: unknown) {
  return CreateSessionRequestSchema.safeParse(data);
}
