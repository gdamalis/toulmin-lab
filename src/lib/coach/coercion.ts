/**
 * Coach result coercion and validation utilities
 * Extracted for testability
 */

import { ToulminStep, TOULMIN_STEPS, getNextStep, ProposalStatus } from '@/types/coach';
import { getStepValidator, ValidationLocale } from '@/lib/services/coach/stepCriteria';

/**
 * Result of coercion including proposal status for debugging
 */
export interface CoercionResult {
  result: Record<string, unknown>;
  proposalStatus: ProposalStatus;
}

/**
 * Sanitize proposedUpdate in the result
 * Returns the proposal status indicating what happened
 */
export function sanitizeProposedUpdate(
  coerced: Record<string, unknown>,
  sessionCurrentStep: ToulminStep
): ProposalStatus {
  const proposedUpdate = coerced.proposedUpdate as { field?: string; value?: string; rationale?: string } | undefined;
  if (!proposedUpdate) return 'none';

  // Field must match current step
  if (proposedUpdate.field !== sessionCurrentStep) {
    console.warn(`Removing proposedUpdate for field '${proposedUpdate.field}' - expected '${sessionCurrentStep}'`);
    delete coerced.proposedUpdate;
    return 'stripped-wrong-step';
  }
  
  // Value must be non-empty
  if (typeof proposedUpdate.value !== 'string' || proposedUpdate.value.trim() === '') {
    console.warn(`Removing proposedUpdate with empty value for '${sessionCurrentStep}'`);
    delete coerced.proposedUpdate;
    return 'stripped-empty-value';
  }

  // Trim value and rationale
  proposedUpdate.value = proposedUpdate.value.trim();
  if (typeof proposedUpdate.rationale === 'string') {
    proposedUpdate.rationale = proposedUpdate.rationale.trim();
  }
  return 'kept';
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
 * @param isFirstAttempt - True if this is the first user turn for this step
 * @param isRewriteRequest - True if the user explicitly asked for a rewrite
 * @param userTextPassesHeuristics - True if the user's latest message passes step validation heuristics
 * @returns CoercionResult with the coerced result and proposal status
 */
export function coerceResultToCurrentStep(
  result: Record<string, unknown>,
  sessionCurrentStep: ToulminStep,
  draftFieldValue: string = '',
  locale: ValidationLocale = 'en',
  isFirstAttempt: boolean = false,
  isRewriteRequest: boolean = false,
  userTextPassesHeuristics: boolean = false
): CoercionResult {
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
  let proposalStatus = sanitizeProposedUpdate(coerced, sessionCurrentStep);

  // First-attempt bias: Apply strict gating on true first attempt (not subsequent turns)
  // This prevents the AI from writing the argument for the user on first contact
  if (proposalStatus === 'kept' && isFirstAttempt && !isRewriteRequest) {
    const confidence = coerced.confidence as number | undefined;
    const proposedValue = (coerced.proposedUpdate as { value?: string } | undefined)?.value ?? '';
    const MIN_CONFIDENCE_FOR_FIRST_ATTEMPT_PROPOSAL = 0.8;
    
    if (confidence !== undefined && confidence < MIN_CONFIDENCE_FOR_FIRST_ATTEMPT_PROPOSAL) {
      // Explicit low confidence on first attempt - strip proposal
      console.warn(
        `Stripping proposedUpdate on first attempt: confidence ${confidence} ` +
        `below threshold ${MIN_CONFIDENCE_FOR_FIRST_ATTEMPT_PROPOSAL}`
      );
      delete coerced.proposedUpdate;
      proposalStatus = 'stripped-low-confidence';
    } else if (confidence === undefined) {
      // Missing confidence on first attempt - use user text heuristics as gatekeeper
      // If user's text passes heuristics, allow proposal (user is making good progress)
      // If it doesn't pass, strip proposal (coach them instead)
      if (!userTextPassesHeuristics) {
        console.warn(
          `Stripping proposedUpdate on first attempt: missing confidence and user's text ` +
          `doesn't pass ${sessionCurrentStep} validation heuristics`
        );
        delete coerced.proposedUpdate;
        proposalStatus = 'stripped-first-attempt-failed-heuristics';
      }
      // If heuristics pass, keep the proposal (allows high-quality first-attempt proposals)
    }
  }

  // Process advancement logic
  if (coerced.shouldAdvance !== true) {
    return { result: coerced, proposalStatus };
  }

  // Handle rebuttal (last step) - can't advance, set isComplete instead
  if (sessionCurrentStep === TOULMIN_STEPS.REBUTTAL) {
    coerced.shouldAdvance = false;
    coerced.isComplete = true;
    delete coerced.nextStep;
    return { result: coerced, proposalStatus };
  }

  // Save-driven advancement: force shouldAdvance=false if draft field is empty (new-content flow)
  // User must click "Use this" on the proposal before we can advance
  const stepHasContent = draftFieldValue.trim() !== '';
  if (!stepHasContent) {
    console.warn(
      `Forcing shouldAdvance=false: draft.${sessionCurrentStep} is empty (save-driven advancement)`
    );
    coerced.shouldAdvance = false;
    delete coerced.nextStep;
    return { result: coerced, proposalStatus };
  }

  // Check if advancement should be allowed (additional heuristics)
  if (!shouldAllowAdvancement(coerced, sessionCurrentStep, draftFieldValue, locale)) {
    coerced.shouldAdvance = false;
    delete coerced.nextStep;
    return { result: coerced, proposalStatus };
  }

  // Ensure nextStep is correct
  const correctNextStep = getNextStep(sessionCurrentStep);
  if (correctNextStep && coerced.nextStep !== correctNextStep) {
    console.warn(`Correcting nextStep from '${coerced.nextStep}' to '${correctNextStep}'`);
    coerced.nextStep = correctNextStep;
  }

  return { result: coerced, proposalStatus };
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

