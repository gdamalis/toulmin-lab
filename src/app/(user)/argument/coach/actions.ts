'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getCoachSessionsCollection, 
  getCoachMessagesCollection, 
  getArgumentDraftsCollection 
} from '@/lib/mongodb/collections/coach';
import { createToulminArgument } from '@/lib/mongodb/service';
import { generateArgumentTitle } from '@/lib/ai/coach';
import { SupportedLocale } from '@/lib/ai/prompts/coachSystemPrompt';
import { 
  ChatSession, 
  ChatMessage, 
  ArgumentDraft,
  ClientChatSession,
  ClientChatMessage,
  ClientArgumentDraft,
  CoachSessionData,
  TOULMIN_STEPS,
  SESSION_STATUS,
  ToulminStep,
  SessionStatus,
} from '@/types/coach';
import { ToulminArgumentPart } from '@/types/toulmin';
import { updateDraftFromEditor as updateDraftService } from '@/lib/services/coach';
import { ToulminArgument } from '@/types/client';
import { 
  validateCreateSession, 
  validateDraftUpdate,
} from '@/lib/validation/coach';
import { ApiResponse } from '@/lib/api/responses';
import { 
  checkRateLimit, 
  SESSION_CREATE_RATE_LIMIT, 
  FINALIZE_RATE_LIMIT,
  TITLE_GENERATION_RATE_LIMIT,
} from '@/lib/api/rateLimit';
import { getLocale, getTranslations } from 'next-intl/server';

/**
 * Convert MongoDB session to client-safe format
 */
function toClientSession(session: ChatSession): ClientChatSession {
  if (!session._id) {
    throw new Error('Session is missing an _id');
  }

  return {
    id: session._id.toString(),
    userId: session.userId,
    currentStep: session.currentStep,
    status: session.status,
    argumentId: session.argumentId,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

/**
 * Convert MongoDB message to client-safe format
 */
function toClientMessage(message: ChatMessage): ClientChatMessage {
  if (!message._id) {
    throw new Error('Message is missing an _id');
  }

  return {
    id: message._id.toString(),
    sessionId: message.sessionId.toString(),
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    step: message.step,
  };
}

/**
 * Convert MongoDB draft to client-safe format
 */
function toClientDraft(draft: ArgumentDraft): ClientArgumentDraft {
  if (!draft._id) {
    throw new Error('Draft is missing an _id');
  }

  return {
    id: draft._id.toString(),
    sessionId: draft.sessionId.toString(),
    name: draft.name,
    claim: draft.claim,
    grounds: draft.grounds,
    warrant: draft.warrant,
    groundsBacking: draft.groundsBacking,
    warrantBacking: draft.warrantBacking,
    qualifier: draft.qualifier,
    rebuttal: draft.rebuttal,
    version: draft.version,
    createdAt: draft.createdAt.toISOString(),
    updatedAt: draft.updatedAt.toISOString(),
  };
}

/**
 * Get authenticated user ID
 */
async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

/**
 * Get session status (lightweight check before loading full data)
 * Used to redirect completed sessions before loading draft/messages
 */
export async function getSessionStatus(
  sessionId: string
): Promise<ApiResponse<{ status: SessionStatus; argumentId?: string }>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    if (!ObjectId.isValid(sessionId)) {
      return { success: false, error: 'Invalid session ID' };
    }

    const sessionsCol = await getCoachSessionsCollection();
    const session = await sessionsCol.findOne({ 
      _id: new ObjectId(sessionId), 
      userId 
    });

    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    return {
      success: true,
      data: { 
        status: session.status, 
        argumentId: session.argumentId 
      },
    };
  } catch (error) {
    console.error('Error getting session status:', error);
    return { success: false, error: 'Failed to load session' };
  }
}

/**
 * Create a new coaching session
 */
export async function createSession(
  formData?: { name?: string }
): Promise<ApiResponse<{ sessionId: string }>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(`session:${userId}`, SESSION_CREATE_RATE_LIMIT);
    if (!rateLimitResult.allowed) {
      return { 
        success: false, 
        error: `rate_limit_exceeded:${rateLimitResult.retryAfter ?? 60}`,
      };
    }

    const validation = validateCreateSession(formData ?? {});
    if (!validation.success) {
      return { success: false, error: 'Invalid request data' };
    }

    // Get translations for server-side content
    const t = await getTranslations('pages.coach');

    const now = new Date();
    const sessionsCol = await getCoachSessionsCollection();
    const draftsCol = await getArgumentDraftsCollection();
    const messagesCol = await getCoachMessagesCollection();

    // Create session
    const session: Omit<ChatSession, '_id'> = {
      userId,
      currentStep: TOULMIN_STEPS.CLAIM,
      status: SESSION_STATUS.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    const sessionResult = await sessionsCol.insertOne(session as ChatSession);
    const sessionId = sessionResult.insertedId;

    // Create empty draft
    const draft: Omit<ArgumentDraft, '_id'> = {
      sessionId,
      userId,
      name: validation.data.name ?? t('untitledArgument'),
      claim: '',
      grounds: '',
      warrant: '',
      groundsBacking: '',
      warrantBacking: '',
      qualifier: '',
      rebuttal: '',
      version: 0,
      createdAt: now,
      updatedAt: now,
    };

    await draftsCol.insertOne(draft as ArgumentDraft);

    // Add welcome message
    const welcomeMessage: Omit<ChatMessage, '_id'> = {
      sessionId,
      role: 'assistant',
      content: t('welcome'),
      createdAt: now,
      step: TOULMIN_STEPS.CLAIM,
    };

    await messagesCol.insertOne(welcomeMessage as ChatMessage);

    return { 
      success: true, 
      data: { sessionId: sessionId.toString() } 
    };
  } catch (error) {
    console.error('Error creating session:', error);
    return { success: false, error: 'Failed to create session' };
  }
}

/**
 * Load a session with messages and draft
 */
export async function loadSession(
  sessionId: string
): Promise<ApiResponse<CoachSessionData>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    if (!ObjectId.isValid(sessionId)) {
      return { success: false, error: 'Invalid session ID' };
    }

    const sessionsCol = await getCoachSessionsCollection();
    const messagesCol = await getCoachMessagesCollection();
    const draftsCol = await getArgumentDraftsCollection();

    const objectId = new ObjectId(sessionId);

    // Fetch session
    const session = await sessionsCol.findOne({ 
      _id: objectId, 
      userId 
    });

    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    // Fetch messages
    const messages = await messagesCol
      .find({ sessionId: objectId })
      .sort({ createdAt: 1 })
      .toArray();

    // Fetch draft
    const draft = await draftsCol.findOne({ sessionId: objectId });

    if (!draft) {
      return { success: false, error: 'Draft not found' };
    }

    return {
      success: true,
      data: {
        session: toClientSession(session),
        messages: messages.map(toClientMessage),
        draft: toClientDraft(draft),
      },
    };
  } catch (error) {
    console.error('Error loading session:', error);
    return { success: false, error: 'Failed to load session' };
  }
}

/**
 * Save a draft field update with optimistic locking
 * When saving a claim for the first time, automatically generates a title
 */
export async function saveDraftField(
  sessionId: string,
  field: ToulminStep,
  value: string,
  expectedVersion: number
): Promise<ApiResponse<{ version: number; name?: string }>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    const validation = validateDraftUpdate({ sessionId, field, value, version: expectedVersion });
    if (!validation.success) {
      return { success: false, error: 'Invalid update data' };
    }

    if (!ObjectId.isValid(sessionId)) {
      return { success: false, error: 'Invalid session ID' };
    }

    const draftsCol = await getArgumentDraftsCollection();
    const objectId = new ObjectId(sessionId);

    // Get translations for checking untitled state
    const t = await getTranslations('pages.coach');
    const untitledName = t('untitledArgument');

    // Build the update object
    const updateFields: Record<string, unknown> = {
      [field]: value,
      updatedAt: new Date(),
    };

    let generatedTitle: string | undefined;

    // Generate title when saving claim for the first time
    if (field === TOULMIN_STEPS.CLAIM && value.trim()) {
      // Fetch current draft to check if name is untitled
      const currentDraft = await draftsCol.findOne({ 
        sessionId: objectId, 
        userId,
        version: expectedVersion 
      });

      if (currentDraft && (!currentDraft.name || currentDraft.name === untitledName)) {
        // Rate limit title generation to prevent abuse
        const titleRateLimitResult = checkRateLimit(`title:${userId}`, TITLE_GENERATION_RATE_LIMIT);
        if (titleRateLimitResult.allowed) {
          try {
            // Get locale for title generation
            const rawLocale = await getLocale();
            const locale: SupportedLocale = rawLocale === 'es' ? 'es' : 'en';
            
            // Timeout safeguard: don't let title generation block the save for too long
            const TITLE_GENERATION_TIMEOUT_MS = 5000;
            const titlePromise = generateArgumentTitle(value, locale, userId);
            const timeoutPromise = new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Title generation timed out')), TITLE_GENERATION_TIMEOUT_MS)
            );
            
            generatedTitle = await Promise.race([titlePromise, timeoutPromise]);
            updateFields.name = generatedTitle;
          } catch {
            // Log but don't fail the save if title generation fails or times out
            console.warn('Failed to generate title (may have timed out)');
          }
        } else {
          console.warn('Title generation rate limited, skipping');
        }
      }
    }

    // Optimistic locking: only update if version matches
    const result = await draftsCol.findOneAndUpdate(
      { 
        sessionId: objectId, 
        userId,
        version: expectedVersion 
      },
      {
        $set: updateFields,
        $inc: { version: 1 },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return { 
        success: false, 
        error: 'Version conflict - please refresh and try again' 
      };
    }

    return { 
      success: true, 
      data: { 
        version: result.version,
        ...(generatedTitle && { name: generatedTitle }),
      } 
    };
  } catch (error) {
    console.error('Error saving draft field:', error);
    return { success: false, error: 'Failed to save draft' };
  }
}

/**
 * Update session's current step
 */
export async function updateSessionStep(
  sessionId: string,
  step: ToulminStep
): Promise<ApiResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    if (!ObjectId.isValid(sessionId)) {
      return { success: false, error: 'Invalid session ID' };
    }

    const sessionsCol = await getCoachSessionsCollection();
    const objectId = new ObjectId(sessionId);

    const result = await sessionsCol.updateOne(
      { _id: objectId, userId },
      { 
        $set: { 
          currentStep: step, 
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: 'Session not found' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating session step:', error);
    return { success: false, error: 'Failed to update session' };
  }
}

/**
 * Add a message to the session
 */
export async function addMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  step?: ToulminStep
): Promise<ApiResponse<{ messageId: string }>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    if (!ObjectId.isValid(sessionId)) {
      return { success: false, error: 'Invalid session ID' };
    }

    // Validate content is a non-empty string
    if (typeof content !== 'string' || content.trim() === '') {
      return { success: false, error: 'Message content must be a non-empty string' };
    }

    const messagesCol = await getCoachMessagesCollection();
    const sessionsCol = await getCoachSessionsCollection();
    const objectId = new ObjectId(sessionId);

    // Verify session ownership
    const session = await sessionsCol.findOne({ _id: objectId, userId });
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const message: Omit<ChatMessage, '_id'> = {
      sessionId: objectId,
      role,
      content,
      createdAt: new Date(),
      step,
    };

    const result = await messagesCol.insertOne(message as ChatMessage);

    return { 
      success: true, 
      data: { messageId: result.insertedId.toString() } 
    };
  } catch (error) {
    console.error('Error adding message:', error);
    return { success: false, error: 'Failed to add message' };
  }
}

/**
 * Finalize argument from draft - converts draft to permanent argument
 * Returns the new argument ID for navigation
 * 
 * This operation is idempotent: if the session is already COMPLETED with an argumentId,
 * it returns that argumentId without re-creating the argument.
 * 
 * Write order (safe without transactions):
 * 1. Check idempotency (return existing if COMPLETED)
 * 2. Create permanent argument
 * 3. Update session to COMPLETED + argumentId
 * 4. Best-effort cleanup of draft/messages
 */
export async function finalizeArgumentFromDraft(
  sessionId: string
): Promise<ApiResponse<{ argumentId: string }>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    // Rate limiting (idempotency guard allows repeated calls, but rate limit prevents spam)
    const rateLimitResult = checkRateLimit(`finalize:${userId}`, FINALIZE_RATE_LIMIT);
    if (!rateLimitResult.allowed) {
      return { 
        success: false, 
        error: `rate_limit_exceeded:${rateLimitResult.retryAfter ?? 60}`,
      };
    }

    if (!ObjectId.isValid(sessionId)) {
      return { success: false, error: 'Invalid session ID' };
    }

    const objectId = new ObjectId(sessionId);
    const sessionsCol = await getCoachSessionsCollection();

    // Idempotency guard: if session is already COMPLETED with argumentId, return it
    const existingSession = await sessionsCol.findOne({ _id: objectId, userId });
    if (!existingSession) {
      return { success: false, error: 'Session not found' };
    }
    
    if (existingSession.status === SESSION_STATUS.COMPLETED && existingSession.argumentId) {
      // Already finalized - return existing argumentId
      return { 
        success: true, 
        data: { argumentId: existingSession.argumentId } 
      };
    }

    const draftsCol = await getArgumentDraftsCollection();

    // Fetch draft
    const draft = await draftsCol.findOne({ sessionId: objectId, userId });
    if (!draft) {
      return { success: false, error: 'Draft not found' };
    }

    // Get translations for fallback title
    const t = await getTranslations('pages.coach');

    // Ensure argument has a non-empty title
    const argumentName = draft.name?.trim() || t('untitledArgument');

    // Convert draft to ToulminArgument format
    const argument: ToulminArgument = {
      name: argumentName,
      author: {
        _id: userId,
        userId,
        name: '', // Will be filled by service
      },
      parts: {
        claim: draft.claim,
        grounds: draft.grounds,
        warrant: draft.warrant,
        groundsBacking: draft.groundsBacking,
        warrantBacking: draft.warrantBacking,
        qualifier: draft.qualifier,
        rebuttal: draft.rebuttal,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Step 1: Create the permanent argument
    const argumentId = await createToulminArgument(argument, userId);

    // Step 2: Update session to COMPLETED + argumentId BEFORE cleanup
    // This ensures we don't end up with ACTIVE session + missing draft
    await sessionsCol.updateOne(
      { _id: objectId, userId },
      { 
        $set: { 
          status: SESSION_STATUS.COMPLETED,
          argumentId,
          updatedAt: new Date(),
        } 
      }
    );

    // Step 3: Best-effort cleanup of draft and messages (non-blocking)
    const messagesCol = await getCoachMessagesCollection();
    Promise.allSettled([
      draftsCol.deleteOne({ sessionId: objectId }),
      messagesCol.deleteMany({ sessionId: objectId }),
    ]).catch((cleanupError) => {
      console.warn('Failed to clean up draft/messages after finalization:', cleanupError);
    });

    revalidatePath('/dashboard');
    revalidatePath(`/argument/view/${argumentId}`);

    return { 
      success: true, 
      data: { argumentId } 
    };
  } catch (error) {
    console.error('Error finalizing argument:', error);
    return { success: false, error: 'Failed to finalize argument' };
  }
}

/**
 * Get user's active sessions
 */
export async function getActiveSessions(): Promise<ApiResponse<ClientChatSession[]>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    const sessionsCol = await getCoachSessionsCollection();
    
    const sessions = await sessionsCol
      .find({ 
        userId, 
        status: SESSION_STATUS.ACTIVE 
      })
      .sort({ updatedAt: -1 })
      .limit(10)
      .toArray();

    return {
      success: true,
      data: sessions.map(toClientSession),
    };
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return { success: false, error: 'Failed to fetch sessions' };
  }
}

/**
 * Validate draft editor update data
 * Returns error message if invalid, null if valid
 */
function validateDraftEditorUpdate(data: {
  name: string;
  parts: ToulminArgumentPart;
  version: number;
}): string | null {
  if (!data.name || typeof data.name !== 'string') {
    return 'Name is required';
  }
  if (!data.parts || typeof data.parts !== 'object') {
    return 'Parts are required';
  }
  if (typeof data.version !== 'number' || data.version < 0) {
    return 'Invalid version';
  }

  // Validate parts fields (max length 2000 each to match Zod schema)
  const maxFieldLength = 2000;
  const partFields = ['claim', 'grounds', 'warrant', 'groundsBacking', 'warrantBacking', 'qualifier', 'rebuttal'] as const;
  for (const field of partFields) {
    const value = data.parts[field];
    if (typeof value !== 'string') {
      return `Invalid ${field} value`;
    }
    if (value.length > maxFieldLength) {
      return `${field} exceeds maximum length of ${maxFieldLength} characters`;
    }
  }

  return null;
}

/**
 * Update a draft from the diagram editor
 * Server action wrapper for updateDraftFromEditor service
 */
export async function updateDraftFromEditorAction(
  sessionId: string,
  data: {
    name: string;
    parts: ToulminArgumentPart;
    version: number;
  }
): Promise<ApiResponse<{ version: number }>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    if (!ObjectId.isValid(sessionId)) {
      return { success: false, error: 'Invalid session ID' };
    }

    const validationError = validateDraftEditorUpdate(data);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const result = await updateDraftService(sessionId, userId, data);
    return result;
  } catch (error) {
    console.error('Error updating draft from editor:', error);
    return { success: false, error: 'Failed to update draft' };
  }
}
