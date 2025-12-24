import { 
  ChatMessage, 
  ToulminStep, 
  ArgumentProgress, 
  AIChatResult,
  DraftState,
  QualifierDraft
} from '@/types/chat';
import { ToulminArgumentPart } from '@/types/toulmin';
import { Locale } from '@/i18n/settings';
import { createDefaultGeminiChatProvider } from '@/lib/ai/providers/gemini-chat';
import { ApiResponse } from '@/lib/api/responses';

/**
 * Global chat AI provider instance
 */
let chatProvider: ReturnType<typeof createDefaultGeminiChatProvider> | null = null;

/**
 * Get or create the chat AI provider
 */
const getChatProvider = () => {
  if (!chatProvider) {
    chatProvider = createDefaultGeminiChatProvider();
  }
  return chatProvider;
};

/**
 * Step order for navigation
 */
const STEP_ORDER: ToulminStep[] = [
  'intro', 'claim', 'warrant', 'warrantBacking', 
  'grounds', 'groundsBacking', 'qualifier', 'rebuttal', 'done'
];

/**
 * Get next step in the sequence
 */
export function getNextStep(currentStep: ToulminStep): ToulminStep {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === STEP_ORDER.length - 1) {
    return 'done';
  }
  return STEP_ORDER[currentIndex + 1];
}

/**
 * Get previous step in the sequence
 */
export function getPreviousStep(currentStep: ToulminStep): ToulminStep | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  if (currentIndex <= 0) return null;
  return STEP_ORDER[currentIndex - 1];
}

/**
 * Map step to argument part name
 */
export function stepToPartName(step: ToulminStep): keyof ToulminArgumentPart | null {
  const mapping: Record<string, keyof ToulminArgumentPart> = {
    'claim': 'claim',
    'warrant': 'warrant',
    'warrantBacking': 'warrantBacking',
    'grounds': 'grounds',
    'groundsBacking': 'groundsBacking',
    'qualifier': 'qualifier',
    'rebuttal': 'rebuttal'
  };
  return mapping[step] || null;
}

/**
 * Generate AI chat response for guided argument creation
 */
export const generateChatResponse = async (
  messages: ChatMessage[],
  currentStep: ToulminStep,
  currentDraft: DraftState | QualifierDraft | undefined,
  argumentProgress: ArgumentProgress,
  language: Locale = 'en'
): Promise<AIChatResult> => {
  try {
    const provider = getChatProvider();
    
    const result = await provider.generateChatResponse(
      messages,
      currentStep,
      currentDraft,
      argumentProgress,
      language
    );

    return result;
  } catch (error) {
    console.error('Error generating chat response:', error);
    
    return {
      success: false,
      message: language === 'es' 
        ? 'Lo siento, encontré un error. Por favor intenta de nuevo.'
        : 'I apologize, but I encountered an error. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Validate content for a specific step
 */
export const validateStepContent = async (
  step: ToulminStep,
  content: string,
  argumentProgress: ArgumentProgress,
  language: Locale = 'en'
): Promise<ApiResponse<{
  valid: boolean;
  suggestions?: string[];
  extractedContent?: string;
}>> => {
  try {
    const provider = getChatProvider();
    
    const result = await provider.validateStepContent(
      step,
      content,
      argumentProgress,
      language
    );

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error validating step content:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Validation failed'
    };
  }
};

/**
 * Generate guidance for a specific step
 */
export const generateStepGuidance = async (
  step: ToulminStep,
  argumentProgress: ArgumentProgress,
  language: Locale = 'en'
): Promise<ApiResponse<{
  message: string;
  examples?: string[];
  tips?: string[];
}>> => {
  try {
    const provider = getChatProvider();
    
    const result = await provider.generateStepGuidance(
      step,
      argumentProgress,
      language
    );

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error generating step guidance:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate guidance'
    };
  }
};

/**
 * Check if chat AI service is available
 */
export const isChatAIAvailable = (): boolean => {
  try {
    getChatProvider();
    return true;
  } catch (error) {
    console.error('Chat AI service not available:', error);
    return false;
  }
};

/**
 * Get step information for UI
 */
export const getStepInfo = (
  currentStep: ToulminStep,
  argumentProgress: ArgumentProgress,
  language: Locale = 'en'
) => {
  const steps = {
    intro: {
      title: language === 'es' ? 'Introducción' : 'Introduction',
      description: language === 'es' 
        ? 'Describe tu tema o enunciado principal'
        : 'Describe your topic or main claim'
    },
    claim: {
      title: language === 'es' ? 'Enunciado' : 'Claim',
      description: language === 'es'
        ? 'La tesis principal que consideras verdadera'
        : 'The main thesis you consider to be true'
    },
    warrant: {
      title: language === 'es' ? 'Garantía' : 'Warrant',
      description: language === 'es'
        ? 'Principio general que conecta evidencia con enunciado'
        : 'General principle linking evidence to claim'
    },
    warrantBacking: {
      title: language === 'es' ? 'Respaldo de Garantía' : 'Warrant Backing',
      description: language === 'es'
        ? 'Fuentes que apoyan la garantía'
        : 'Sources supporting the warrant'
    },
    grounds: {
      title: language === 'es' ? 'Evidencia' : 'Grounds',
      description: language === 'es'
        ? 'Datos o hechos que apoyan el enunciado'
        : 'Data or facts supporting the claim'
    },
    groundsBacking: {
      title: language === 'es' ? 'Respaldo de Evidencia' : 'Grounds Backing',
      description: language === 'es'
        ? 'Fuentes de la evidencia'
        : 'Sources for the evidence'
    },
    qualifier: {
      title: language === 'es' ? 'Calificador' : 'Qualifier',
      description: language === 'es'
        ? 'Nivel de credibilidad del enunciado'
        : 'Level of credibility of the claim'
    },
    rebuttal: {
      title: language === 'es' ? 'Refutación' : 'Rebuttal',
      description: language === 'es'
        ? 'Escenarios donde el enunciado podría ser falso'
        : 'Scenarios where the claim might be false'
    },
    done: {
      title: language === 'es' ? 'Completado' : 'Complete',
      description: language === 'es'
        ? 'Argumento completado exitosamente'
        : 'Argument completed successfully'
    }
  };
  
  return STEP_ORDER.map((step) => ({
    step,
    title: steps[step].title,
    description: steps[step].description,
    isCompleted: getStepCompletionStatus(step, argumentProgress),
    isActive: step === currentStep
  }));
};

/**
 * Check if a step is completed based on argument progress
 */
const getStepCompletionStatus = (
  step: ToulminStep,
  argumentProgress: ArgumentProgress
): boolean => {
  switch (step) {
    case 'intro':
      return !!argumentProgress.topic;
    case 'claim':
      return !!argumentProgress.claim;
    case 'warrant':
      return !!argumentProgress.warrant;
    case 'warrantBacking':
      return !!argumentProgress.warrantBacking;
    case 'grounds':
      return !!argumentProgress.grounds;
    case 'groundsBacking':
      return !!argumentProgress.groundsBacking;
    case 'qualifier':
      return !!argumentProgress.qualifier;
    case 'rebuttal':
      return !!argumentProgress.rebuttal;
    case 'done':
      return !!(argumentProgress.claim && argumentProgress.grounds && 
               argumentProgress.groundsBacking && argumentProgress.warrant && 
               argumentProgress.warrantBacking && argumentProgress.qualifier && 
               argumentProgress.rebuttal);
    default:
      return false;
  }
};
