import { ObjectId } from 'mongodb';
import { BaseEntity } from './base';
import { 
  ChatSession, 
  ChatMessage, 
  ChatSessionStatus, 
  ToulminStep, 
  ArgumentProgress,
  ChatMessageRole 
} from './chat';
import { Locale } from '@/i18n/settings';

/**
 * MongoDB collection interface for chat messages
 */
export interface ChatMessageCollection {
  _id: ObjectId;
  role: ChatMessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    step?: ToulminStep;
    suggestions?: string[];
    extractedContent?: string;
    needsImprovement?: boolean;
    validationPassed?: boolean;
  };
}

/**
 * MongoDB collection interface for chat sessions
 */
export interface ChatSessionCollection extends BaseEntity {
  _id: ObjectId;
  userId: string;
  title: string;
  status: ChatSessionStatus;
  currentStep: ToulminStep;
  argumentProgress: ArgumentProgress;
  drafts: {
    [key: string]: unknown;  // Stored as flexible object for MongoDB
  };
  suggestedActions?: string[];
  messages: ChatMessageCollection[];
  generatedArgumentId?: ObjectId;
  language: Locale;
}

/**
 * Type converters between client and MongoDB types
 */
export const toChatMessageCollection = (message: ChatMessage): ChatMessageCollection => ({
  _id: new ObjectId(),
  role: message.role,
  content: message.content,
  timestamp: message.timestamp,
  metadata: message.metadata
});

export const toClientChatMessage = (doc: ChatMessageCollection): ChatMessage => ({
  id: doc._id.toString(),
  role: doc.role,
  content: doc.content,
  timestamp: doc.timestamp,
  metadata: doc.metadata
});

export const toChatSessionCollection = (session: ChatSession): Omit<ChatSessionCollection, '_id'> => ({
  userId: session.userId,
  title: session.title,
  status: session.status,
  currentStep: session.currentStep,
  argumentProgress: session.argumentProgress,
  drafts: session.drafts || {},
  suggestedActions: session.suggestedActions,
  messages: session.messages.map(toChatMessageCollection),
  generatedArgumentId: session.generatedArgumentId ? new ObjectId(session.generatedArgumentId) : undefined,
  language: session.language,
  createdAt: session.createdAt,
  updatedAt: session.updatedAt
});

export const toClientChatSession = (doc: ChatSessionCollection): ChatSession => ({
  _id: doc._id.toString(),
  userId: doc.userId,
  title: doc.title,
  status: doc.status,
  currentStep: doc.currentStep,
  argumentProgress: doc.argumentProgress,
  drafts: doc.drafts || {},
  suggestedActions: doc.suggestedActions as any,
  messages: doc.messages.map(toClientChatMessage),
  generatedArgumentId: doc.generatedArgumentId?.toString(),
  language: doc.language,
  createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
  updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt)
});

