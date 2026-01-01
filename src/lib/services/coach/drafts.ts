'use server';

import { ObjectId } from 'mongodb';
import {
  getCoachSessionsCollection,
  getCoachMessagesCollection,
  getArgumentDraftsCollection,
} from '@/lib/mongodb/collections/coach';
import {
  ArgumentDraft,
  ChatSession,
  SESSION_STATUS,
  ToulminStep,
  ClientArgumentDraft,
} from '@/types/coach';
import { ToulminArgumentPart } from '@/types/toulmin';
import { ApiResponse } from '@/lib/api/responses';

/**
 * Overview of a draft for dashboard listing
 */
export interface DraftOverview {
  sessionId: string;
  name: string;
  currentStep: ToulminStep;
  createdAt: string;
  updatedAt: string;
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
 * Get draft overviews for a user (active sessions only)
 */
export async function getUserDraftOverviews(
  userId: string
): Promise<ApiResponse<DraftOverview[]>> {
  try {
    const [sessionsCol, draftsCol] = await Promise.all([
      getCoachSessionsCollection(),
      getArgumentDraftsCollection(),
    ]);

    // Find active sessions
    const activeSessions = await sessionsCol
      .find({ userId, status: SESSION_STATUS.ACTIVE })
      .sort({ updatedAt: -1 })
      .toArray();

    if (activeSessions.length === 0) {
      return { success: true, data: [] };
    }

    // Get drafts for those sessions
    const sessionIds = activeSessions.map((s) => s._id);
    const drafts = await draftsCol
      .find({ sessionId: { $in: sessionIds }, userId })
      .toArray();

    // Build a map of sessionId -> draft
    const draftMap = new Map<string, ArgumentDraft>();
    for (const draft of drafts) {
      draftMap.set(draft.sessionId.toString(), draft);
    }

    // Build overviews
    const overviews: DraftOverview[] = activeSessions
      .map((session) => {
        const draft = draftMap.get(session._id!.toString());
        if (!draft) return null;

        return {
          sessionId: session._id!.toString(),
          name: draft.name || 'Untitled Draft',
          currentStep: session.currentStep,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        };
      })
      .filter((o): o is DraftOverview => o !== null);

    return { success: true, data: overviews };
  } catch (error) {
    console.error('Error fetching draft overviews:', error);
    return { success: false, error: 'Failed to fetch drafts' };
  }
}

/**
 * Get a draft by session ID
 */
export async function getDraftBySessionId(
  sessionId: string,
  userId: string
): Promise<ApiResponse<ClientArgumentDraft>> {
  try {
    if (!ObjectId.isValid(sessionId)) {
      return { success: false, error: 'Invalid session ID' };
    }

    const draftsCol = await getArgumentDraftsCollection();
    const objectId = new ObjectId(sessionId);

    const draft = await draftsCol.findOne({ sessionId: objectId, userId });

    if (!draft) {
      return { success: false, error: 'Draft not found' };
    }

    return { success: true, data: toClientDraft(draft) };
  } catch (error) {
    console.error('Error fetching draft:', error);
    return { success: false, error: 'Failed to fetch draft' };
  }
}

/**
 * Update draft name and parts from the diagram editor
 */
export async function updateDraftFromEditor(
  sessionId: string,
  userId: string,
  data: {
    name: string;
    parts: ToulminArgumentPart;
    version: number;
  }
): Promise<ApiResponse<{ version: number }>> {
  try {
    if (!ObjectId.isValid(sessionId)) {
      return { success: false, error: 'Invalid session ID' };
    }

    const draftsCol = await getArgumentDraftsCollection();
    const objectId = new ObjectId(sessionId);

    // Optimistic locking: only update if version matches
    const result = await draftsCol.findOneAndUpdate(
      {
        sessionId: objectId,
        userId,
        version: data.version,
      },
      {
        $set: {
          name: data.name,
          claim: data.parts.claim,
          grounds: data.parts.grounds,
          warrant: data.parts.warrant,
          groundsBacking: data.parts.groundsBacking,
          warrantBacking: data.parts.warrantBacking,
          qualifier: data.parts.qualifier,
          rebuttal: data.parts.rebuttal,
          updatedAt: new Date(),
        },
        $inc: { version: 1 },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return {
        success: false,
        error: 'Version conflict - please refresh and try again',
      };
    }

    return { success: true, data: { version: result.version } };
  } catch (error) {
    console.error('Error updating draft:', error);
    return { success: false, error: 'Failed to update draft' };
  }
}

/**
 * Delete a coach session and its associated draft and messages
 */
export async function deleteCoachSessionAndDraft(
  sessionId: string,
  userId: string
): Promise<ApiResponse> {
  try {
    if (!ObjectId.isValid(sessionId)) {
      return { success: false, error: 'Invalid session ID' };
    }

    const objectId = new ObjectId(sessionId);

    const [sessionsCol, messagesCol, draftsCol] = await Promise.all([
      getCoachSessionsCollection(),
      getCoachMessagesCollection(),
      getArgumentDraftsCollection(),
    ]);

    // Verify ownership before deleting
    const session = await sessionsCol.findOne({ _id: objectId, userId });
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    // Delete all related data
    // Draft deletion uses sessionId only (ownership already verified on session)
    const [, , draftResult] = await Promise.all([
      sessionsCol.deleteOne({ _id: objectId, userId }),
      messagesCol.deleteMany({ sessionId: objectId }),
      draftsCol.deleteOne({ sessionId: objectId }),
    ]);

    if (draftResult.deletedCount === 0) {
      console.warn(
        `[deleteCoachSessionAndDraft] No draft found for sessionId=${sessionId}, userId=${userId}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting coach session:', error);
    return { success: false, error: 'Failed to delete session' };
  }
}

/**
 * Resolve an ID to either an argument or a draft
 * Returns { kind: 'argument' | 'draft', id, sessionId? }
 */
export async function resolveArgumentOrDraft(
  id: string,
  userId: string
): Promise<
  ApiResponse<
    { kind: 'argument'; id: string } | { kind: 'draft'; sessionId: string }
  >
> {
  try {
    if (!ObjectId.isValid(id)) {
      return { success: false, error: 'Invalid ID' };
    }

    const objectId = new ObjectId(id);

    // Check if it's a coach session first (faster path for drafts)
    const sessionsCol = await getCoachSessionsCollection();
    const session = await sessionsCol.findOne({
      _id: objectId,
      userId,
      status: SESSION_STATUS.ACTIVE,
    });

    if (session) {
      return { success: true, data: { kind: 'draft', sessionId: id } };
    }

    // Otherwise assume it's an argument ID
    // (We don't need to verify here - the argument API will handle that)
    return { success: true, data: { kind: 'argument', id } };
  } catch (error) {
    console.error('Error resolving ID:', error);
    return { success: false, error: 'Failed to resolve ID' };
  }
}
