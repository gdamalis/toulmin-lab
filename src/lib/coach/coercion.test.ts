import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  coerceResultToCurrentStep,
  trySalvageCoachResult,
  sanitizeProposedUpdate,
  shouldAllowAdvancement,
} from './coercion';
import { TOULMIN_STEPS } from '@/types/coach';

// Mock console.warn to keep test output clean
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('coerceResultToCurrentStep', () => {
  describe('step coercion', () => {
    it('should force step to match session current step', () => {
      const result = {
        assistantText: 'Test response',
        step: 'grounds', // Wrong step
      };
      
      const coerced = coerceResultToCurrentStep(result, TOULMIN_STEPS.CLAIM);
      
      expect(coerced.step).toBe(TOULMIN_STEPS.CLAIM);
    });
    
    it('should not modify step if already correct', () => {
      const result = {
        assistantText: 'Test response',
        step: TOULMIN_STEPS.CLAIM,
      };
      
      const coerced = coerceResultToCurrentStep(result, TOULMIN_STEPS.CLAIM);
      
      expect(coerced.step).toBe(TOULMIN_STEPS.CLAIM);
    });
  });

  describe('assistantText trimming', () => {
    it('should trim whitespace from assistantText', () => {
      const result = {
        assistantText: '  Test response  ',
        step: TOULMIN_STEPS.CLAIM,
      };
      
      const coerced = coerceResultToCurrentStep(result, TOULMIN_STEPS.CLAIM);
      
      expect(coerced.assistantText).toBe('Test response');
    });
  });

  describe('proposedUpdate sanitization', () => {
    it('should remove proposedUpdate if field does not match current step', () => {
      const result = {
        assistantText: 'Test response',
        step: TOULMIN_STEPS.CLAIM,
        proposedUpdate: {
          field: 'grounds', // Wrong field
          value: 'Some value',
          rationale: 'Some rationale',
        },
      };
      
      const coerced = coerceResultToCurrentStep(result, TOULMIN_STEPS.CLAIM);
      
      expect(coerced.proposedUpdate).toBeUndefined();
    });
    
    it('should remove proposedUpdate with empty value', () => {
      const result = {
        assistantText: 'Test response',
        step: TOULMIN_STEPS.CLAIM,
        proposedUpdate: {
          field: TOULMIN_STEPS.CLAIM,
          value: '   ',
          rationale: 'Some rationale',
        },
      };
      
      const coerced = coerceResultToCurrentStep(result, TOULMIN_STEPS.CLAIM);
      
      expect(coerced.proposedUpdate).toBeUndefined();
    });
    
    it('should keep valid proposedUpdate and trim value', () => {
      const result = {
        assistantText: 'Test response',
        step: TOULMIN_STEPS.CLAIM,
        proposedUpdate: {
          field: TOULMIN_STEPS.CLAIM,
          value: '  Valid claim value  ',
          rationale: '  Valid rationale  ',
        },
      };
      
      const coerced = coerceResultToCurrentStep(result, TOULMIN_STEPS.CLAIM);
      
      expect(coerced.proposedUpdate).toBeDefined();
      const update = coerced.proposedUpdate as { value: string; rationale: string };
      expect(update.value).toBe('Valid claim value');
      expect(update.rationale).toBe('Valid rationale');
    });
  });

  describe('advancement logic', () => {
    it('should not modify result if shouldAdvance is false', () => {
      const result = {
        assistantText: 'Test response',
        step: TOULMIN_STEPS.CLAIM,
        shouldAdvance: false,
      };
      
      const coerced = coerceResultToCurrentStep(result, TOULMIN_STEPS.CLAIM);
      
      expect(coerced.shouldAdvance).toBe(false);
    });
    
    it('should convert shouldAdvance to isComplete on rebuttal step', () => {
      const result = {
        assistantText: 'Test response',
        step: TOULMIN_STEPS.REBUTTAL,
        shouldAdvance: true,
        nextStep: 'invalid',
      };
      
      const coerced = coerceResultToCurrentStep(result, TOULMIN_STEPS.REBUTTAL);
      
      expect(coerced.shouldAdvance).toBe(false);
      expect(coerced.isComplete).toBe(true);
      expect(coerced.nextStep).toBeUndefined();
    });
    
    it('should strip shouldAdvance if no proposedUpdate and draft field is empty', () => {
      const result = {
        assistantText: 'Test response',
        step: TOULMIN_STEPS.CLAIM,
        shouldAdvance: true,
        nextStep: TOULMIN_STEPS.GROUNDS,
      };
      
      const coerced = coerceResultToCurrentStep(result, TOULMIN_STEPS.CLAIM, '');
      
      expect(coerced.shouldAdvance).toBe(false);
      expect(coerced.nextStep).toBeUndefined();
    });
    
    it('should strip shouldAdvance if confidence is below threshold', () => {
      const result = {
        assistantText: 'Test response',
        step: TOULMIN_STEPS.CLAIM,
        shouldAdvance: true,
        nextStep: TOULMIN_STEPS.GROUNDS,
        confidence: 0.3, // Below 0.6 threshold
        proposedUpdate: {
          field: TOULMIN_STEPS.CLAIM,
          value: 'Valid claim value',
          rationale: 'Valid rationale',
        },
      };
      
      const coerced = coerceResultToCurrentStep(result, TOULMIN_STEPS.CLAIM);
      
      expect(coerced.shouldAdvance).toBe(false);
      expect(coerced.nextStep).toBeUndefined();
    });
    
    it('should correct nextStep if wrong', () => {
      const result = {
        assistantText: 'Test response',
        step: TOULMIN_STEPS.CLAIM,
        shouldAdvance: true,
        nextStep: 'warrant', // Should be 'grounds'
        confidence: 0.8,
        proposedUpdate: {
          field: TOULMIN_STEPS.CLAIM,
          value: 'Universities should require critical thinking courses for all students.',
          rationale: 'Valid rationale',
        },
      };
      
      const coerced = coerceResultToCurrentStep(result, TOULMIN_STEPS.CLAIM);
      
      expect(coerced.nextStep).toBe(TOULMIN_STEPS.GROUNDS);
    });
  });
});

describe('trySalvageCoachResult', () => {
  it('should return null for non-object errors', () => {
    expect(trySalvageCoachResult(null)).toBeNull();
    expect(trySalvageCoachResult(undefined)).toBeNull();
    expect(trySalvageCoachResult('string error')).toBeNull();
  });
  
  it('should return null if error has no text property', () => {
    expect(trySalvageCoachResult({ message: 'error' })).toBeNull();
  });
  
  it('should return null if text is not valid JSON', () => {
    expect(trySalvageCoachResult({ text: 'not json' })).toBeNull();
  });
  
  it('should compute nextStep if shouldAdvance is true and nextStep is missing', () => {
    const error = {
      text: JSON.stringify({
        assistantText: 'Test',
        step: TOULMIN_STEPS.CLAIM,
        shouldAdvance: true,
        // nextStep is missing
      }),
    };
    
    const salvaged = trySalvageCoachResult(error);
    
    expect(salvaged).not.toBeNull();
    expect(salvaged?.nextStep).toBe(TOULMIN_STEPS.GROUNDS);
  });
  
  it('should convert shouldAdvance to isComplete on rebuttal step', () => {
    const error = {
      text: JSON.stringify({
        assistantText: 'Test',
        step: TOULMIN_STEPS.REBUTTAL,
        shouldAdvance: true,
      }),
    };
    
    const salvaged = trySalvageCoachResult(error);
    
    expect(salvaged).not.toBeNull();
    expect(salvaged?.shouldAdvance).toBe(false);
    expect(salvaged?.isComplete).toBe(true);
    expect(salvaged?.nextStep).toBeUndefined();
  });
  
  it('should return parsed result without modifications if nextStep is present', () => {
    const error = {
      text: JSON.stringify({
        assistantText: 'Test',
        step: TOULMIN_STEPS.CLAIM,
        shouldAdvance: true,
        nextStep: TOULMIN_STEPS.GROUNDS,
      }),
    };
    
    const salvaged = trySalvageCoachResult(error);
    
    expect(salvaged).not.toBeNull();
    expect(salvaged?.nextStep).toBe(TOULMIN_STEPS.GROUNDS);
  });
});

describe('sanitizeProposedUpdate', () => {
  it('should return false if no proposedUpdate', () => {
    const coerced: Record<string, unknown> = {};
    const result = sanitizeProposedUpdate(coerced, TOULMIN_STEPS.CLAIM);
    expect(result).toBe(false);
  });
  
  it('should remove and return false if field mismatches', () => {
    const coerced: Record<string, unknown> = {
      proposedUpdate: {
        field: TOULMIN_STEPS.GROUNDS,
        value: 'test',
        rationale: 'test',
      },
    };
    
    const result = sanitizeProposedUpdate(coerced, TOULMIN_STEPS.CLAIM);
    
    expect(result).toBe(false);
    expect(coerced.proposedUpdate).toBeUndefined();
  });
  
  it('should remove and return false if value is empty', () => {
    const coerced: Record<string, unknown> = {
      proposedUpdate: {
        field: TOULMIN_STEPS.CLAIM,
        value: '',
        rationale: 'test',
      },
    };
    
    const result = sanitizeProposedUpdate(coerced, TOULMIN_STEPS.CLAIM);
    
    expect(result).toBe(false);
    expect(coerced.proposedUpdate).toBeUndefined();
  });
  
  it('should return true and trim values for valid proposedUpdate', () => {
    const coerced: Record<string, unknown> = {
      proposedUpdate: {
        field: TOULMIN_STEPS.CLAIM,
        value: '  trimmed value  ',
        rationale: '  trimmed rationale  ',
      },
    };
    
    const result = sanitizeProposedUpdate(coerced, TOULMIN_STEPS.CLAIM);
    
    expect(result).toBe(true);
    const update = coerced.proposedUpdate as { value: string; rationale: string };
    expect(update.value).toBe('trimmed value');
    expect(update.rationale).toBe('trimmed rationale');
  });
});

describe('shouldAllowAdvancement', () => {
  it('should return false if no proposal and empty draft content', () => {
    const coerced: Record<string, unknown> = {};
    
    const result = shouldAllowAdvancement(coerced, TOULMIN_STEPS.CLAIM, '', 'en');
    
    expect(result).toBe(false);
  });
  
  it('should return true if draft has valid content for claim', () => {
    const coerced: Record<string, unknown> = {};
    
    // A valid claim
    const result = shouldAllowAdvancement(
      coerced, 
      TOULMIN_STEPS.CLAIM, 
      'Universities should require all students to take a course in critical thinking.',
      'en'
    );
    
    expect(result).toBe(true);
  });
  
  it('should return false if confidence is below threshold', () => {
    const coerced: Record<string, unknown> = {
      confidence: 0.3,
      proposedUpdate: {
        value: 'Universities should require critical thinking courses.',
      },
    };
    
    const result = shouldAllowAdvancement(
      coerced,
      TOULMIN_STEPS.CLAIM,
      '',
      'en'
    );
    
    expect(result).toBe(false);
  });
  
  it('should return true if confidence is above threshold', () => {
    const coerced: Record<string, unknown> = {
      confidence: 0.8,
      proposedUpdate: {
        value: 'Universities should require critical thinking courses for all students.',
      },
    };
    
    const result = shouldAllowAdvancement(
      coerced,
      TOULMIN_STEPS.CLAIM,
      '',
      'en'
    );
    
    expect(result).toBe(true);
  });
});

