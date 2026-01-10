import { ObjectId } from 'mongodb';

/**
 * Toulmin argument steps in order
 */
export const TOULMIN_STEPS = {
  CLAIM: 'claim',
  GROUNDS: 'grounds',
  WARRANT: 'warrant',
  GROUNDS_BACKING: 'groundsBacking',
  WARRANT_BACKING: 'warrantBacking',
  QUALIFIER: 'qualifier',
  REBUTTAL: 'rebuttal',
} as const;

export type ToulminStep = typeof TOULMIN_STEPS[keyof typeof TOULMIN_STEPS];

/**
 * Ordered array of steps for iteration
 */
export const TOULMIN_STEP_ORDER: ToulminStep[] = [
  TOULMIN_STEPS.CLAIM,
  TOULMIN_STEPS.GROUNDS,
  TOULMIN_STEPS.WARRANT,
  TOULMIN_STEPS.GROUNDS_BACKING,
  TOULMIN_STEPS.WARRANT_BACKING,
  TOULMIN_STEPS.QUALIFIER,
  TOULMIN_STEPS.REBUTTAL,
];

/**
 * Get the next step after the current one
 */
export function getNextStep(currentStep: ToulminStep): ToulminStep | null {
  const currentIndex = TOULMIN_STEP_ORDER.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === TOULMIN_STEP_ORDER.length - 1) {
    return null;
  }
  return TOULMIN_STEP_ORDER[currentIndex + 1];
}



/**
 * Session status enum
 */
export const SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const;

export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];

/**
 * Chat session document
 */
export interface ChatSession {
  _id?: ObjectId;
  userId: string;
  currentStep: ToulminStep;
  status: SessionStatus;
  argumentId?: string; // Set when finalized
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Chat message role
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Chat message document
 */
export interface ChatMessage {
  _id?: ObjectId;
  sessionId: ObjectId;
  role: MessageRole;
  content: string;
  createdAt: Date;
  // Optional metadata
  step?: ToulminStep;
  tokenCount?: number;
}

/**
 * Argument draft document - progressive build of the argument
 */
export interface ArgumentDraft {
  _id?: ObjectId;
  sessionId: ObjectId;
  userId: string;
  name: string;
  claim: string;
  grounds: string;
  warrant: string;
  groundsBacking: string;
  warrantBacking: string;
  qualifier: string;
  rebuttal: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Proposal status indicating what happened to the AI's proposedUpdate
 */
export type ProposalStatus = 
  | 'kept'
  | 'stripped-low-confidence'
  | 'stripped-wrong-step'
  | 'stripped-empty-value'
  | 'stripped-first-attempt-no-confidence'
  | 'stripped-first-attempt-failed-heuristics'
  | 'none';

/**
 * Proposed update from AI
 */
export interface ProposedUpdate {
  field: ToulminStep;
  value: string;
  rationale: string;
}

/**
 * AI response structure
 */
export interface CoachAIResult {
  assistantText: string;
  step: ToulminStep;
  confidence?: number;
  proposedUpdate?: ProposedUpdate;
  nextQuestion?: string;
  shouldAdvance?: boolean;
  nextStep?: ToulminStep;
  isComplete?: boolean;
  /** Debug field indicating what happened to the AI's proposedUpdate */
  proposalStatus?: ProposalStatus;
}

/**
 * Client-safe session data (without ObjectId)
 */
export interface ClientChatSession {
  id: string;
  userId: string;
  currentStep: ToulminStep;
  status: SessionStatus;
  argumentId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Client-safe message data
 */
export interface ClientChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  step?: ToulminStep;
}

/**
 * Client-safe draft data
 */
export interface ClientArgumentDraft {
  id: string;
  sessionId: string;
  name: string;
  claim: string;
  grounds: string;
  warrant: string;
  groundsBacking: string;
  warrantBacking: string;
  qualifier: string;
  rebuttal: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Full session data for client
 */
export interface CoachSessionData {
  session: ClientChatSession;
  messages: ClientChatMessage[];
  draft: ClientArgumentDraft;
}
