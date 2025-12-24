import { Locale } from '@/i18n/settings';
import { ToulminArgumentPart } from './toulmin';

/**
 * Toulmin argument construction steps in educational order
 */
export type ToulminStep = 
  | 'intro'           // Introduction and topic selection
  | 'claim'           // Main thesis/assertion
  | 'warrant'         // General principle linking grounds→claim
  | 'warrantBacking'  // Sources for the warrant
  | 'grounds'         // Evidence/data
  | 'groundsBacking'  // Sources for grounds
  | 'qualifier'       // Credibility qualifier
  | 'rebuttal'        // Counter-argument scenarios
  | 'done';           // All steps completed

/**
 * Chat session status
 */
export type ChatSessionStatus = 'active' | 'completed' | 'paused';

/**
 * Suggested actions for user
 */
export type SuggestedAction = 'confirm' | 'refine' | 'skip';

/**
 * Draft state for a step
 */
export interface DraftState {
  text: string;
  isReady: boolean;
  issues: string[];
  suggestedEdits?: string;
  lastUpdatedAt: Date;
}

/**
 * Qualifier draft (special case with label + probability)
 */
export interface QualifierDraft extends Omit<DraftState, 'text'> {
  label: string;           // "necessarily", "probably", "plausible", etc.
  probability?: number;    // 0-1 scale
  text?: string;          // Optional natural language explanation
}

/**
 * Intent classification result
 */
export interface ClassifierResult {
  intent: 'ask_question' | 'propose' | 'revise' | 'confirm_part' | 'request_next' | 'meta_help';
  targetPart: ToulminStep | 'current' | 'none';
  extracted: {
    text: string;
  };
  confidence: number;
}

/**
 * Draft & review result from AI
 */
export interface DraftReviewResult {
  draft: string;
  self_review: {
    isReady: boolean;
    issues: string[];
    suggestedEdits?: string;
  };
  nextStepRecommendation: 'stay' | 'advance';
}

/**
 * Chat message role
 */
export type ChatMessageRole = 'user' | 'assistant' | 'system';

/**
 * Individual chat message
 */
export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    step?: ToulminStep;
    suggestions?: string[];
    extractedContent?: string;
    needsImprovement?: boolean;
    validationPassed?: boolean;
    draftState?: {
      isReady: boolean;
      issues: string[];
    };
    // Navigation metadata
    navigatedTo?: ToulminStep;
    confirmedPart?: string;
    advancedToStep?: ToulminStep;
    isSystemNavigation?: boolean;
  };
}

/**
 * Partial argument progress during chat session
 */
export interface ArgumentProgress extends Partial<ToulminArgumentPart> {
  topic?: string;           // Initial topic/subject
  argumentTitle?: string;   // Generated or user-provided title
}

/**
 * Chat session data model
 */
export interface ChatSession {
  _id?: string;
  userId: string;
  title: string;
  status: ChatSessionStatus;
  currentStep: ToulminStep;
  argumentProgress: ArgumentProgress;  // Keep for backward compat, but prefer drafts
  drafts: {
    [K in Exclude<ToulminStep, 'intro' | 'done'>]?: K extends 'qualifier' 
      ? QualifierDraft 
      : DraftState;
  };
  suggestedActions?: SuggestedAction[];
  messages: ChatMessage[];
  generatedArgumentId?: string; // Link to final ToulminArgument when completed
  language: Locale;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Chat session creation request
 */
export interface CreateChatSessionRequest {
  title?: string;
  language?: Locale;
  initialTopic?: string;
}

/**
 * Send message request
 */
export interface SendMessageRequest {
  content: string;
  sessionId: string;
}

/**
 * Confirm part request
 */
export interface ConfirmPartRequest {
  confirmedText: string;  // Final text user confirms
  // For qualifier:
  qualifierLabel?: string;
  qualifierProbability?: number;
}

/**
 * Confirm part response
 */
export interface ConfirmPartResponse {
  success: boolean;
  nextStep: ToulminStep;
  argumentId: string;
  updatedArgument?: ToulminArgumentPart;
  error?: string;
}

/**
 * AI chat generation result
 */
export interface AIChatResult {
  success: boolean;
  message: string;
  nextStep?: ToulminStep;
  extractedContent?: string;
  suggestions?: string[];
  needsImprovement?: boolean;
  shouldAdvanceStep?: boolean;
  draftReview?: DraftReviewResult;
  classification?: ClassifierResult;
  error?: string;
  confidence?: number;
}

/**
 * Step information for UI guidance
 */
export interface StepInfo {
  step: ToulminStep;
  title: string;
  description: string;
  examples?: string[];
  tips?: string[];
  isCompleted: boolean;
  isActive: boolean;
}

/**
 * Chat AI provider interface extension
 */
export interface ChatAIProvider {
  generateChatResponse(
    messages: ChatMessage[],
    currentStep: ToulminStep,
    currentDraft: DraftState | QualifierDraft | undefined,
    argumentProgress: ArgumentProgress,
    language?: Locale
  ): Promise<AIChatResult>;
  
  validateStepContent(
    step: ToulminStep,
    content: string,
    argumentProgress: ArgumentProgress,
    language?: Locale
  ): Promise<{
    valid: boolean;
    suggestions?: string[];
    extractedContent?: string;
    error?: string;
  }>;
  
  generateStepGuidance(
    step: ToulminStep,
    argumentProgress: ArgumentProgress,
    language?: Locale
  ): Promise<{
    message: string;
    examples?: string[];
    tips?: string[];
  }>;
}

/**
 * Chat session API responses
 */
export interface ChatSessionResponse {
  success: boolean;
  data?: ChatSession;
  error?: string;
}

export interface ChatMessageResponse {
  success: boolean;
  data?: {
    userMessage: ChatMessage;
    aiMessage: ChatMessage;
    nextStep?: ToulminStep;
    argumentProgress?: ArgumentProgress;
    stepCompleted?: boolean;
    currentStep?: ToulminStep;
    // Navigation/confirmation fields
    navigatedTo?: ToulminStep;
    confirmedPart?: string;
    advancedToStep?: ToulminStep;
    currentDraft?: DraftState;
    suggestedActions?: SuggestedAction[];
  };
  error?: string;
}

/**
 * Step completion validation
 */
export interface StepValidation {
  step: ToulminStep;
  isValid: boolean;
  extractedContent?: string;
  suggestions?: string[];
  confidence?: number;
}

/**
 * Argument completion result
 */
export interface ArgumentCompletionResult {
  success: boolean;
  argumentId?: string;
  argument?: any; // ToulminArgument type
  error?: string;
}

