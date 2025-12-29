import { ToulminStep, TOULMIN_STEPS, ArgumentDraft, TOULMIN_STEP_ORDER } from '@/types/coach';

/**
 * Supported locales for validation heuristics
 */
export type ValidationLocale = 'en' | 'es';

/**
 * Minimum confidence threshold for AI to approve a step
 */
const MIN_AI_CONFIDENCE = 0.7;

/**
 * Minimum text length for any Toulmin field
 */
const MIN_FIELD_LENGTH = 10;

/**
 * Check if text looks like a claim (single assertion, not evidence)
 * A good claim:
 * - Is a single declarative statement
 * - Doesn't contain "because" followed by evidence
 * - Doesn't list multiple data points
 * - Is arguable (not a simple fact)
 */
export function isValidClaim(text: string, locale: ValidationLocale = 'en'): boolean {
  const trimmed = text.trim();
  
  if (trimmed.length < MIN_FIELD_LENGTH) return false;
  
  // Should not start with evidence indicators (locale-aware)
  const evidenceStarters = locale === 'es'
    ? /^(los estudios muestran|según|la investigación indica|los datos muestran|estadísticas|\d+%)/i
    : /^(studies show|according to|research indicates|data shows|statistics|\d+%)/i;
  if (evidenceStarters.test(trimmed)) return false;
  
  // Should not be a simple fact with no argument
  const factPatterns = locale === 'es'
    ? /^(el cielo es azul|el agua está mojada|\d+ \+ \d+ =)/i
    : /^(the sky is blue|water is wet|\d+ \+ \d+ =)/i;
  if (factPatterns.test(trimmed)) return false;
  
  return true;
}

/**
 * Check if text looks like grounds (concrete evidence/examples)
 * Good grounds:
 * - Contains specific data, examples, or observations
 * - May include numbers, percentages, or citations
 * - Is concrete, not abstract
 */
export function isValidGrounds(text: string, locale: ValidationLocale = 'en'): boolean {
  const trimmed = text.trim();
  
  if (trimmed.length < MIN_FIELD_LENGTH) return false;
  
  // Look for evidence indicators (positive signals) - locale-aware
  const evidenceIndicatorsEN = [
    /\d+%/, // percentages
    /\d+\s*(people|percent|million|billion|thousand)/i, // numbers with units
    /according to/i,
    /study|research|survey|report/i,
    /for example|for instance|such as/i,
    /observed|found|discovered|measured/i,
    /data|evidence|statistics/i,
  ];
  
  const evidenceIndicatorsES = [
    /\d+%/, // percentages (universal)
    /\d+\s*(personas|por ciento|millones|miles)/i, // numbers with units
    /según|de acuerdo con/i,
    /estudio|investigación|encuesta|informe/i,
    /por ejemplo|como por ejemplo|tales como/i,
    /observó|encontró|descubrió|midió/i,
    /datos|evidencia|estadísticas/i,
  ];
  
  const evidenceIndicators = locale === 'es' ? evidenceIndicatorsES : evidenceIndicatorsEN;
  const hasEvidenceSignal = evidenceIndicators.some(pattern => pattern.test(trimmed));
  
  // Even without explicit markers, longer concrete text is acceptable
  return hasEvidenceSignal || trimmed.length > 50;
}

/**
 * Check if text looks like a warrant (general principle connecting grounds to claim)
 * A good warrant:
 * - Is a general rule or principle
 * - Often has "if...then" structure or implies causation
 * - Bridges the logical gap between evidence and conclusion
 */
export function isValidWarrant(text: string, locale: ValidationLocale = 'en'): boolean {
  const trimmed = text.trim();
  
  if (trimmed.length < MIN_FIELD_LENGTH) return false;
  
  // Look for warrant indicators - locale-aware
  const warrantIndicatorsEN = [
    /if\s+.+\s+then/i,
    /when\s+.+\s+(it|we|they|this)/i,
    /because\s+.+\s+(leads to|results in|causes|means)/i,
    /generally|typically|usually|often/i,
    /principle|rule|law|theory/i,
    /implies|suggests|indicates|demonstrates/i,
    /therefore|thus|hence|consequently/i,
    /the more.+the more/i,
    /leads to|results in|causes|enables/i,
  ];
  
  const warrantIndicatorsES = [
    /si\s+.+\s+entonces/i,
    /cuando\s+.+\s+(esto|nosotros|ellos|se)/i,
    /porque\s+.+\s+(conduce a|resulta en|causa|significa)/i,
    /generalmente|típicamente|usualmente|a menudo/i,
    /principio|regla|ley|teoría/i,
    /implica|sugiere|indica|demuestra/i,
    /por lo tanto|así|por ende|en consecuencia/i,
    /cuanto más.+más/i,
    /conduce a|resulta en|causa|permite/i,
  ];
  
  const warrantIndicators = locale === 'es' ? warrantIndicatorsES : warrantIndicatorsEN;
  const hasWarrantSignal = warrantIndicators.some(pattern => pattern.test(trimmed));
  
  // Warrants should express a general principle
  return hasWarrantSignal || trimmed.length > 40;
}

/**
 * Check if text looks like backing (support for grounds or warrant)
 * Good backing:
 * - References sources, authorities, or foundations
 * - May include citations, studies, laws, principles
 */
export function isValidBacking(text: string, locale: ValidationLocale = 'en'): boolean {
  const trimmed = text.trim();
  
  if (trimmed.length < MIN_FIELD_LENGTH) return false;
  
  // Look for backing indicators - locale-aware
  const backingIndicatorsEN = [
    /according to/i,
    /\(\d{4}\)/, // year citations
    /et al\./i,
    /study|research|publication|paper|article/i,
    /expert|authority|specialist/i,
    /law|regulation|policy|standard/i,
    /bible|scripture|quran|torah/i, // religious texts
    /constitution|amendment|statute/i,
    /theory of|principle of|law of/i,
    /professor|doctor|dr\./i,
    /university|institute|organization/i,
    /source:|citation:|reference:/i,
  ];
  
  const backingIndicatorsES = [
    /según|de acuerdo con/i,
    /\(\d{4}\)/, // year citations (universal)
    /et al\./i, // universal
    /estudio|investigación|publicación|artículo/i,
    /experto|autoridad|especialista/i,
    /ley|regulación|política|norma|estándar/i,
    /biblia|escritura|corán|torá/i, // religious texts
    /constitución|enmienda|estatuto/i,
    /teoría de|principio de|ley de/i,
    /profesor|doctor|dra?\./i,
    /universidad|instituto|organización/i,
    /fuente:|cita:|referencia:/i,
  ];
  
  const backingIndicators = locale === 'es' ? backingIndicatorsES : backingIndicatorsEN;
  const hasBackingSignal = backingIndicators.some(pattern => pattern.test(trimmed));
  
  return hasBackingSignal || trimmed.length > 30;
}

/**
 * Check if text looks like a qualifier (strength/scope indicator)
 * A good qualifier:
 * - Indicates degree of certainty
 * - Specifies conditions or scope
 * - Avoids absolute claims (unless justified)
 */
export function isValidQualifier(text: string, locale: ValidationLocale = 'en'): boolean {
  const trimmed = text.trim();
  
  if (trimmed.length < 5) return false; // Qualifiers can be short
  
  // Look for qualifier indicators - locale-aware
  const qualifierIndicatorsEN = [
    /probably|likely|possibly|perhaps/i,
    /most|many|some|few/i,
    /usually|typically|generally|often/i,
    /in most cases|in many situations/i,
    /under (normal|certain|these) conditions/i,
    /tends to|is likely to/i,
    /with (high|some|reasonable) (probability|certainty|confidence)/i,
    /assuming|given that|provided that/i,
    /almost|nearly|virtually/i,
    /to a (large|certain|significant) extent/i,
  ];
  
  const qualifierIndicatorsES = [
    /probablemente|posiblemente|quizás|tal vez/i,
    /la mayoría|muchos|algunos|pocos/i,
    /usualmente|típicamente|generalmente|a menudo/i,
    /en la mayoría de los casos|en muchas situaciones/i,
    /bajo (condiciones|circunstancias) (normales|ciertas|estas)/i,
    /tiende a|es probable que/i,
    /con (alta|cierta|razonable) (probabilidad|certeza|confianza)/i,
    /asumiendo|dado que|siempre que/i,
    /casi|prácticamente|virtualmente/i,
    /en (gran|cierta|significativa) medida/i,
  ];
  
  const qualifierIndicators = locale === 'es' ? qualifierIndicatorsES : qualifierIndicatorsEN;
  const hasQualifierSignal = qualifierIndicators.some(pattern => pattern.test(trimmed));
  
  return hasQualifierSignal || trimmed.length >= 5;
}

/**
 * Check if text looks like a rebuttal (exceptions/conditions)
 * A good rebuttal:
 * - Acknowledges exceptions or counter-arguments
 * - Specifies conditions where the claim might not hold
 */
export function isValidRebuttal(text: string, locale: ValidationLocale = 'en'): boolean {
  const trimmed = text.trim();
  
  if (trimmed.length < MIN_FIELD_LENGTH) return false;
  
  // Look for rebuttal indicators - locale-aware
  const rebuttalIndicatorsEN = [
    /unless|except|however|but/i,
    /would not (apply|hold|work)/i,
    /exception|counter|objection/i,
    /on the other hand/i,
    /might argue|could argue|some say/i,
    /in cases where|when.+does not/i,
    /fails when|breaks down when/i,
    /limitation|weakness|flaw/i,
    /critic|opponent|skeptic/i,
    /challenge|question|dispute/i,
  ];
  
  const rebuttalIndicatorsES = [
    /a menos que|excepto|sin embargo|pero/i,
    /no (aplicaría|funcionaría|serviría)/i,
    /excepción|contra|objeción/i,
    /por otro lado|por otra parte/i,
    /podría argumentar|algunos dicen|se podría decir/i,
    /en casos donde|cuando.+no/i,
    /falla cuando|no funciona cuando/i,
    /limitación|debilidad|defecto/i,
    /crítico|oponente|escéptico/i,
    /desafío|cuestionamiento|disputa/i,
  ];
  
  const rebuttalIndicators = locale === 'es' ? rebuttalIndicatorsES : rebuttalIndicatorsEN;
  const hasRebuttalSignal = rebuttalIndicators.some(pattern => pattern.test(trimmed));
  
  return hasRebuttalSignal || trimmed.length > 30;
}

/**
 * Get the validation function for a specific step
 */
export function getStepValidator(step: ToulminStep, locale: ValidationLocale = 'en'): (text: string) => boolean {
  const validators: Record<ToulminStep, (text: string, locale: ValidationLocale) => boolean> = {
    [TOULMIN_STEPS.CLAIM]: isValidClaim,
    [TOULMIN_STEPS.GROUNDS]: isValidGrounds,
    [TOULMIN_STEPS.WARRANT]: isValidWarrant,
    [TOULMIN_STEPS.GROUNDS_BACKING]: isValidBacking,
    [TOULMIN_STEPS.WARRANT_BACKING]: isValidBacking,
    [TOULMIN_STEPS.QUALIFIER]: isValidQualifier,
    [TOULMIN_STEPS.REBUTTAL]: isValidRebuttal,
  };
  
  return (text: string) => validators[step](text, locale);
}

/**
 * Evaluate if a step is complete enough to advance
 * Combines heuristic validation with AI confidence score
 */
export function evaluateStepCompletion(
  step: ToulminStep,
  text: string,
  aiConfidence?: number,
  locale: ValidationLocale = 'en'
): { isComplete: boolean; reason?: string } {
  const validator = getStepValidator(step, locale);
  const passesHeuristics = validator(text);
  
  // If AI confidence is provided and high enough, trust it
  if (aiConfidence !== undefined && aiConfidence >= MIN_AI_CONFIDENCE) {
    return { isComplete: true };
  }
  
  // If AI confidence is low, don't advance even if heuristics pass
  if (aiConfidence !== undefined && aiConfidence < 0.3) {
    return { 
      isComplete: false, 
      reason: locale === 'es' 
        ? 'El texto necesita más refinamiento para este elemento'
        : 'The text needs more refinement for this element' 
    };
  }
  
  // Use heuristics as fallback
  if (!passesHeuristics) {
    return { 
      isComplete: false, 
      reason: locale === 'es'
        ? `Esto aún no encaja bien en el patrón de ${step}`
        : `This doesn't quite fit the ${step} pattern yet`
    };
  }
  
  return { isComplete: true };
}

/**
 * Check if the entire argument is complete
 * All 7 fields must pass validation
 */
export function isArgumentComplete(draft: ArgumentDraft, locale: ValidationLocale = 'en'): boolean {
  const fields: Array<{ step: ToulminStep; value: string }> = [
    { step: TOULMIN_STEPS.CLAIM, value: draft.claim },
    { step: TOULMIN_STEPS.GROUNDS, value: draft.grounds },
    { step: TOULMIN_STEPS.WARRANT, value: draft.warrant },
    { step: TOULMIN_STEPS.GROUNDS_BACKING, value: draft.groundsBacking },
    { step: TOULMIN_STEPS.WARRANT_BACKING, value: draft.warrantBacking },
    { step: TOULMIN_STEPS.QUALIFIER, value: draft.qualifier },
    { step: TOULMIN_STEPS.REBUTTAL, value: draft.rebuttal },
  ];
  
  return fields.every(({ step, value }) => {
    const validator = getStepValidator(step, locale);
    return value.trim().length > 0 && validator(value);
  });
}

/**
 * Draft fields interface for step completion check
 * Works with both server-side ArgumentDraft and client-side ClientArgumentDraft
 */
interface DraftFields {
  claim: string;
  grounds: string;
  warrant: string;
  groundsBacking: string;
  warrantBacking: string;
  qualifier: string;
  rebuttal: string;
}

/**
 * Get completion status for each step
 * Accepts any object with the required Toulmin fields
 */
export function getStepCompletionStatus(
  draft: DraftFields, 
  locale: ValidationLocale = 'en'
): Record<ToulminStep, boolean> {
  return {
    [TOULMIN_STEPS.CLAIM]: isValidClaim(draft.claim, locale),
    [TOULMIN_STEPS.GROUNDS]: isValidGrounds(draft.grounds, locale),
    [TOULMIN_STEPS.WARRANT]: isValidWarrant(draft.warrant, locale),
    [TOULMIN_STEPS.GROUNDS_BACKING]: isValidBacking(draft.groundsBacking, locale),
    [TOULMIN_STEPS.WARRANT_BACKING]: isValidBacking(draft.warrantBacking, locale),
    [TOULMIN_STEPS.QUALIFIER]: isValidQualifier(draft.qualifier, locale),
    [TOULMIN_STEPS.REBUTTAL]: isValidRebuttal(draft.rebuttal, locale),
  };
}

/**
 * Find the first incomplete step
 */
export function findFirstIncompleteStep(
  draft: ArgumentDraft, 
  locale: ValidationLocale = 'en'
): ToulminStep | null {
  const status = getStepCompletionStatus(draft, locale);
  
  for (const step of TOULMIN_STEP_ORDER) {
    if (!status[step]) {
      return step;
    }
  }
  
  return null; // All complete
}
