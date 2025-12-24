import { COLLECTIONS } from "@/constants/database.constants";
import { ChatSession, ChatMessage, ToulminStep, ChatSessionStatus } from "@/types/chat";
import { ToulminArgumentPart } from "@/types/toulmin";
import { 
  ChatSessionCollection, 
  toChatSessionCollection, 
  toClientChatSession,
  toChatMessageCollection,
  toClientChatMessage
} from "@/types/mongodb-chat";
import { getCollection, toObjectId } from "./client";
import { ObjectId, WithId } from "mongodb";
import clientPromise from "./config";
import { createEmptyToulminArgument, updateToulminArgumentPart } from "./toulmin-arguments";

/**
 * Create a new chat session
 */
export async function createChatSession(
  session: Omit<ChatSession, '_id'>
): Promise<string> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  const dbSession = toChatSessionCollection(session as ChatSession);
  const result = await collection.insertOne(dbSession);
  
  return result.insertedId.toString();
}

/**
 * Find chat session by ID
 */
export async function findChatSessionById(
  id: string
): Promise<ChatSession | null> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  const doc = await collection.findOne({ _id: toObjectId(id) });
  
  if (!doc) {
    return null;
  }
  
  return toClientChatSession(doc);
}

/**
 * Find chat session by ID for a specific user
 */
export async function findChatSessionByIdForUser(
  id: string,
  userId: string
): Promise<ChatSession | null> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  const doc = await collection.findOne({ 
    _id: toObjectId(id),
    userId 
  });
  
  if (!doc) {
    return null;
  }
  
  return toClientChatSession(doc);
}

/**
 * Find all chat sessions for a user
 */
export async function findChatSessionsByUserId(
  userId: string
): Promise<ChatSession[]> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  const docs = await collection
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();
  
  return docs.map(toClientChatSession);
}

/**
 * Find active chat session for a user (only one active session allowed)
 */
export async function findActiveChatSessionForUser(
  userId: string
): Promise<ChatSession | null> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  const doc = await collection.findOne({ 
    userId,
    status: 'active'
  });
  
  if (!doc) {
    return null;
  }
  
  return toClientChatSession(doc);
}

/**
 * Update chat session
 */
export async function updateChatSession(
  id: string,
  updates: Partial<ChatSession>
): Promise<boolean> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  const updateDoc: any = {
    ...updates,
    updatedAt: new Date()
  };
  
  // Handle ObjectId conversion for generatedArgumentId
  if (updates.generatedArgumentId) {
    updateDoc.generatedArgumentId = toObjectId(updates.generatedArgumentId);
  }
  
  // Convert messages if provided
  if (updates.messages) {
    updateDoc.messages = updates.messages.map(toChatMessageCollection);
  }
  
  const result = await collection.updateOne(
    { _id: toObjectId(id) },
    { $set: updateDoc }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Add message to chat session
 */
export async function addMessageToChatSession(
  sessionId: string,
  message: ChatMessage
): Promise<boolean> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  const messageDoc = toChatMessageCollection(message);
  
  const result = await collection.updateOne(
    { _id: toObjectId(sessionId) },
    { 
      $push: { messages: messageDoc },
      $set: { updatedAt: new Date() }
    }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Update chat session step and progress
 */
export async function updateChatSessionProgress(
  sessionId: string,
  currentStep: ToulminStep,
  argumentProgress: any
): Promise<boolean> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  const result = await collection.updateOne(
    { _id: toObjectId(sessionId) },
    { 
      $set: { 
        currentStep,
        argumentProgress,
        updatedAt: new Date()
      }
    }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Update chat session status
 */
export async function updateChatSessionStatus(
  sessionId: string,
  status: ChatSessionStatus
): Promise<boolean> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  const result = await collection.updateOne(
    { _id: toObjectId(sessionId) },
    { 
      $set: { 
        status,
        updatedAt: new Date()
      }
    }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Delete chat session
 */
export async function deleteChatSession(
  id: string,
  userId: string
): Promise<boolean> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  const result = await collection.deleteOne({ 
    _id: toObjectId(id),
    userId 
  });
  
  return result.deletedCount > 0;
}

/**
 * Pause all active sessions for a user (when starting a new one)
 */
export async function pauseActiveSessionsForUser(
  userId: string
): Promise<boolean> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  const result = await collection.updateMany(
    { 
      userId,
      status: 'active'
    },
    { 
      $set: { 
        status: 'paused',
        updatedAt: new Date()
      }
    }
  );
  
  return result.modifiedCount >= 0;
}

/**
 * Get chat session statistics for a user
 */
export async function getChatSessionStats(
  userId: string
): Promise<{
  total: number;
  active: number;
  completed: number;
  paused: number;
}> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  const [total, active, completed, paused] = await Promise.all([
    collection.countDocuments({ userId }),
    collection.countDocuments({ userId, status: 'active' }),
    collection.countDocuments({ userId, status: 'completed' }),
    collection.countDocuments({ userId, status: 'paused' })
  ]);
  
  return { total, active, completed, paused };
}

/**
 * Update draft for a specific step
 */
export async function updateDraft(
  sessionId: string,
  step: ToulminStep,
  draft: any
): Promise<boolean> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  const result = await collection.updateOne(
    { _id: toObjectId(sessionId) },
    { 
      $set: { 
        [`drafts.${step}`]: draft,
        updatedAt: new Date()
      }
    }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Navigate to a specific step (for revision or navigation)
 * Loads existing content as draft if the step has confirmed content
 */
export async function navigateToStep(
  sessionId: string,
  userId: string,
  targetStep: ToulminStep
): Promise<{ success: boolean; loadedDraft?: boolean }> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  // Verify session belongs to user
  const session = await findChatSessionByIdForUser(sessionId, userId);
  if (!session) {
    throw new Error('Session not found');
  }

  // Check if target step has existing confirmed content
  const existingContent = session.argumentProgress[targetStep as keyof typeof session.argumentProgress];
  
  // Build update object
  const updateFields: Record<string, unknown> = {
    currentStep: targetStep,
    updatedAt: new Date()
  };
  
  // If there's existing confirmed content, load it as a draft for editing
  let loadedDraft = false;
  if (existingContent && typeof existingContent === 'string' && existingContent.trim()) {
    updateFields[`drafts.${targetStep}`] = {
      text: existingContent,
      isReady: true,  // Assume previously confirmed content is ready
      issues: [],
      lastUpdatedAt: new Date()
    };
    loadedDraft = true;
  }

  const result = await collection.updateOne(
    { _id: toObjectId(sessionId), userId },
    { $set: updateFields }
  );

  return { 
    success: result.modifiedCount > 0,
    loadedDraft
  };
}

/**
 * Update suggested actions
 */
export async function updateSuggestedActions(
  sessionId: string,
  actions: string[]
): Promise<boolean> {
  const collection = await getCollection<ChatSessionCollection>(COLLECTIONS.CHAT_SESSIONS);
  
  const result = await collection.updateOne(
    { _id: toObjectId(sessionId) },
    { 
      $set: { 
        suggestedActions: actions,
        updatedAt: new Date()
      }
    }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Get next step in the sequence
 */
function getNextStep(currentStep: ToulminStep): ToulminStep {
  const stepOrder: ToulminStep[] = [
    'intro', 'claim', 'warrant', 'warrantBacking', 
    'grounds', 'groundsBacking', 'qualifier', 'rebuttal', 'done'
  ];
  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return 'done';
  }
  return stepOrder[currentIndex + 1];
}

/**
 * Confirm a part and advance to next step (with transaction)
 */
export async function confirmPartAndAdvance(
  sessionId: string,
  userId: string,
  part: keyof ToulminArgumentPart,
  confirmedText: string
): Promise<{ success: boolean; argumentId: string; nextStep: ToulminStep }> {
  const client = await clientPromise;
  const session = client.startSession();
  
  let result: { success: boolean; argumentId: string; nextStep: ToulminStep };
  
  try {
    await session.withTransaction(async () => {
      // 1. Get chat session
      const chatSession = await findChatSessionByIdForUser(sessionId, userId);
      if (!chatSession) {
        throw new Error("Chat session not found");
      }
      
      // 2. Create argument if first confirm, otherwise update
      let argumentId = chatSession.generatedArgumentId;
      
      if (!argumentId) {
        argumentId = await createEmptyToulminArgument(
          chatSession.argumentProgress.argumentTitle || chatSession.title,
          userId
        );
        
        // Link argument to session
        await updateChatSession(sessionId, { generatedArgumentId: argumentId });
      }
      
      // 3. Update argument part
      await updateToulminArgumentPart(argumentId, part, confirmedText, userId);
      
      // 4. Advance session step
      const nextStep = getNextStep(chatSession.currentStep);
      await updateChatSessionProgress(sessionId, nextStep, {
        ...chatSession.argumentProgress,
        [part]: confirmedText
      });
      
      result = { success: true, argumentId, nextStep };
    });
    
    return result!;
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  } finally {
    await session.endSession();
  }
}

/**
 * Skip a part and advance to next step
 */
export async function skipPartAndAdvance(
  sessionId: string,
  userId: string,
  part: keyof ToulminArgumentPart
): Promise<{ success: boolean; nextStep: ToulminStep; argumentId?: string }> {
  const result = await confirmPartAndAdvance(sessionId, userId, part, '');
  return result;
}

