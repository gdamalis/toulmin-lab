import { Collection, Document } from 'mongodb';
import { getCollection, getMongoClient } from '../client';
import { COLLECTIONS, COACH_DATA_TTL_SECONDS } from '@/constants/database.constants';
import { ChatSession, ChatMessage, ArgumentDraft } from '@/types/coach';

/**
 * Get the coach sessions collection
 */
export async function getCoachSessionsCollection(): Promise<Collection<ChatSession & Document>> {
  return getCollection<ChatSession & Document>(COLLECTIONS.COACH_SESSIONS);
}

/**
 * Get the coach messages collection
 */
export async function getCoachMessagesCollection(): Promise<Collection<ChatMessage & Document>> {
  return getCollection<ChatMessage & Document>(COLLECTIONS.COACH_MESSAGES);
}

/**
 * Get the argument drafts collection
 */
export async function getArgumentDraftsCollection(): Promise<Collection<ArgumentDraft & Document>> {
  return getCollection<ArgumentDraft & Document>(COLLECTIONS.ARGUMENT_DRAFTS);
}

/**
 * Ensure all coach-related indexes are created
 * This should be called on application startup
 * 
 * Creates:
 * - TTL indexes for automatic data retention (30 days)
 * - Query optimization indexes
 */
export async function ensureCoachIndexes(): Promise<void> {
  const [sessionsCol, messagesCol, draftsCol] = await Promise.all([
    getCoachSessionsCollection(),
    getCoachMessagesCollection(),
    getArgumentDraftsCollection(),
  ]);

  // Sessions indexes
  await Promise.all([
    // TTL index for 30-day retention
    sessionsCol.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: COACH_DATA_TTL_SECONDS, background: true }
    ),
    // Query by userId
    sessionsCol.createIndex({ userId: 1, createdAt: -1 }, { background: true }),
    // Query by status
    sessionsCol.createIndex({ userId: 1, status: 1 }, { background: true }),
  ]);

  // Messages indexes
  await Promise.all([
    // TTL index for 30-day retention
    messagesCol.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: COACH_DATA_TTL_SECONDS, background: true }
    ),
    // Query by sessionId
    messagesCol.createIndex({ sessionId: 1, createdAt: 1 }, { background: true }),
  ]);

  // Drafts indexes
  await Promise.all([
    // TTL index for 30-day retention
    draftsCol.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: COACH_DATA_TTL_SECONDS, background: true }
    ),
    // Query by sessionId (unique)
    draftsCol.createIndex({ sessionId: 1 }, { unique: true, background: true }),
    // Query by userId
    draftsCol.createIndex({ userId: 1, createdAt: -1 }, { background: true }),
  ]);

  console.log('Coach indexes ensured');
}
