/**
 * Coach result coercion and validation utilities
 * Extracted for testability
 */

import { ToulminStep, TOULMIN_STEPS, getNextStep } from '@/types/coach';
import { getStepValidator, ValidationLocale } from '@/lib/services/coach/stepCriteria';

/**
 * Sanitize proposedUpdate in the result
 * Returns true if proposedUpdate is valid after sanitization, false if it was removed
 */
export function sanitizeProposedUpdate(
  coerced: Record<string, unknown>,
  sessionCurrentStep: ToulminStep
): boolean {
  const proposedUpdate = coerced.proposedUpdate as { field?: string; value?: string; rationale?: string } | undefined;
  if (!proposedUpdate) return false;

  // Field must match current step
  if (proposedUpdate.field !== sessionCurrentStep) {
    console.warn(`Removing proposedUpdate for field '${proposedUpdate.field}' - expected '${sessionCurrentStep}'`);
    delete coerced.proposedUpdate;
    return false;
  }
  
  // Value must be non-empty
  if (typeof proposedUpdate.value !== 'string' || proposedUpdate.value.trim() === '') {
    console.warn(`Removing proposedUpdate with empty value for '${sessionCurrentStep}'`);
    delete coerced.proposedUpdate;
    return false;
  }

  // Trim value and rationale
  proposedUpdate.value = proposedUpdate.value.trim();
  if (typeof proposedUpdate.rationale === 'string') {
    proposedUpdate.rationale = proposedUpdate.rationale.trim();
  }
  return true;
}

/**
 * Check if advancement should be allowed based on content and heuristics
 */
export function shouldAllowAdvancement(
  coerced: Record<string, unknown>,
  sessionCurrentStep: ToulminStep,
  draftFieldValue: string,
  locale: ValidationLocale
): boolean {
  const hasValidProposal = coerced.proposedUpdate !== undefined;
  const stepHasContent = draftFieldValue.trim() !== '';

  // Must have either a proposal or existing content
  if (!hasValidProposal && !stepHasContent) {
    console.warn(`Stripping shouldAdvance=true: no proposedUpdate and draft.${sessionCurrentStep} is empty`);
    return false;
  }

  // Gate advancement using step heuristics
  const proposedValue = (coerced.proposedUpdate as { value?: string } | undefined)?.value ?? '';
  const textToValidate = proposedValue || draftFieldValue;
  const stepValidator = getStepValidator(sessionCurrentStep, locale);

  if (!stepValidator(textToValidate)) {
    console.warn(`Stripping shouldAdvance=true: text doesn't pass ${sessionCurrentStep} validation heuristics`);
    return false;
  }

  // Check confidence threshold if provided
  const confidence = coerced.confidence as number | undefined;
  const MIN_CONFIDENCE_FOR_ADVANCE = 0.6;
  if (confidence !== undefined && confidence < MIN_CONFIDENCE_FOR_ADVANCE) {
    console.warn(`Stripping shouldAdvance=true: confidence ${confidence} below threshold ${MIN_CONFIDENCE_FOR_ADVANCE}`);
    return false;
  }

  return true;
}

/**
 * Coerce the AI result to match the session's current step
 * This prevents the model from proposing updates to wrong fields or skipping steps
 * @param draftFieldValue - The current value of the draft field for this step (empty string if not set)
 * @param locale - Locale for step validation heuristics
 */
export function coerceResultToCurrentStep(
  result: Record<string, unknown>,
  sessionCurrentStep: ToulminStep,
  draftFieldValue: string = '',
  locale: ValidationLocale = 'en'
): Record<string, unknown> {
  const coerced = { ...result };

  // Force step to match session's current step
  if (coerced.step !== sessionCurrentStep) {
    console.warn(`Coercing AI step '${coerced.step}' to session step '${sessionCurrentStep}'`);
    coerced.step = sessionCurrentStep;
  }

  // Trim assistantText to avoid empty/whitespace-only responses
  if (typeof coerced.assistantText === 'string') {
    coerced.assistantText = coerced.assistantText.trim();
  }

  // Validate and sanitize proposedUpdate
  sanitizeProposedUpdate(coerced, sessionCurrentStep);

  // Process advancement logic
  if (coerced.shouldAdvance !== true) {
    return coerced;
  }

  // Handle rebuttal (last step) - can't advance, set isComplete instead
  if (sessionCurrentStep === TOULMIN_STEPS.REBUTTAL) {
    coerced.shouldAdvance = false;
    coerced.isComplete = true;
    delete coerced.nextStep;
    return coerced;
  }

  // Check if advancement should be allowed
  if (!shouldAllowAdvancement(coerced, sessionCurrentStep, draftFieldValue, locale)) {
    coerced.shouldAdvance = false;
    delete coerced.nextStep;
    return coerced;
  }

  // Ensure nextStep is correct
  const correctNextStep = getNextStep(sessionCurrentStep);
  if (correctNextStep && coerced.nextStep !== correctNextStep) {
    console.warn(`Correcting nextStep from '${coerced.nextStep}' to '${correctNextStep}'`);
    coerced.nextStep = correctNextStep;
  }

  return coerced;
}

/**
 * Try to salvage a coach result when the model forgets nextStep
 * This patches the result so it passes schema validation
 */
export function trySalvageCoachResult(err: unknown): Record<string, unknown> | null {
  if (!err || typeof err !== 'object') return null;

  // Vercel AI SDK errors sometimes include the generated text payload
  const text = (err as { text?: unknown }).text;
  if (typeof text !== 'string') return null;

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const shouldAdvance = parsed.shouldAdvance === true;
    const nextStep = parsed.nextStep;

    if (shouldAdvance && (nextStep === undefined || nextStep === null)) {
      const step = parsed.step as ToulminStep | undefined;
      if (!step) return parsed;

      // Don't advance from rebuttal; set isComplete=true instead
      if (step === TOULMIN_STEPS.REBUTTAL) {
        parsed.shouldAdvance = false;
        parsed.isComplete = true;
        delete parsed.nextStep;
        return parsed;
      }

      const computed = getNextStep(step);
      if (computed) parsed.nextStep = computed;
    }

    // Also handle case where shouldAdvance is true and step is rebuttal (even with nextStep set)
    if (parsed.shouldAdvance === true && parsed.step === TOULMIN_STEPS.REBUTTAL) {
      parsed.shouldAdvance = false;
      parsed.isComplete = true;
      delete parsed.nextStep;
    }

    return parsed;
  } catch {
    return null;
  }
}

