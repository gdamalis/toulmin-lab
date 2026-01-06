import { Collection, Document, ObjectId } from 'mongodb';
import { getCollection } from '../client';
import { COLLECTIONS, COACH_DATA_TTL_SECONDS } from '@/constants/database.constants';

/**
 * Status of an AI request event
 */
export const AI_REQUEST_STATUS = {
  OK: 'ok',
  ERROR: 'error',
  QUOTA_DENIED: 'quota_denied',
  RATE_LIMITED: 'rate_limited',
} as const;

export type AiRequestStatus = typeof AI_REQUEST_STATUS[keyof typeof AI_REQUEST_STATUS];

/**
 * Feature identifier for AI request events
 */
export const AI_FEATURE = {
  COACH_CHAT: 'coach_chat',
  COACH_TITLE: 'coach_title',
} as const;

export type AiFeature = typeof AI_FEATURE[keyof typeof AI_FEATURE];

/**
 * Shape of an AI request event document in MongoDB
 */
export interface AiRequestEventDocument extends Document {
  _id?: ObjectId;
  /** Timestamp of the request */
  ts: Date;
  /** Firebase uid of the user (null for anonymous/system) */
  uid: string | null;
  /** Feature identifier (e.g., coach_chat, coach_title) */
  feature: AiFeature;
  /** AI provider name (e.g., gemini, openai, anthropic) */
  provider: string;
  /** Full model identifier (e.g., gemini-2.0-flash) */
  model: string;
  /** Request status */
  status: AiRequestStatus;
  /** Duration in milliseconds (null if not completed) */
  durationMs: number | null;
  /** Optional coach session ID for correlation */
  sessionId?: string;
  /** Created at timestamp (used for TTL) */
  createdAt: Date;
}

/**
 * Input for creating an AI request event
 */
export interface AiRequestEventInput {
  uid: string | null;
  feature: AiFeature;
  provider: string;
  model: string;
  status: AiRequestStatus;
  durationMs?: number | null;
  sessionId?: string;
}

/**
 * Get the AI request events collection
 */
export async function getAiRequestEventsCollection(): Promise<Collection<AiRequestEventDocument>> {
  return getCollection<AiRequestEventDocument>(COLLECTIONS.AI_REQUEST_EVENTS);
}

/**
 * Promise to ensure indexes are created exactly once per runtime
 */
let indexesEnsured: Promise<void> | null = null;

/**
 * Ensure all AI request event indexes are created
 * This is called automatically by the first insert operation
 */
export async function ensureAiRequestEventIndexes(): Promise<void> {
  if (indexesEnsured) {
    return indexesEnsured;
  }

  indexesEnsured = (async () => {
    const collection = await getAiRequestEventsCollection();

    await Promise.all([
      // TTL index: auto-delete after 30 days (matches coach data retention)
      collection.createIndex(
        { createdAt: 1 },
        { 
          expireAfterSeconds: COACH_DATA_TTL_SECONDS, 
          background: true,
          name: 'ttl_createdAt_30d',
        }
      ),
      // Query index for time-series aggregation
      collection.createIndex(
        { ts: -1 },
        { background: true, name: 'idx_ts_desc' }
      ),
      // Query index for per-user lookups
      collection.createIndex(
        { uid: 1, ts: -1 },
        { background: true, name: 'idx_uid_ts' }
      ),
      // Query index for feature filtering
      collection.createIndex(
        { feature: 1, ts: -1 },
        { background: true, name: 'idx_feature_ts' }
      ),
      // Query index for provider+model filtering
      collection.createIndex(
        { provider: 1, model: 1, ts: -1 },
        { background: true, name: 'idx_provider_model_ts' }
      ),
      // Compound index for status filtering in aggregations
      collection.createIndex(
        { status: 1, ts: -1 },
        { background: true, name: 'idx_status_ts' }
      ),
    ]);

    console.log('AI request event indexes ensured');
  })();

  return indexesEnsured;
}

/**
 * Insert a single AI request event
 * Automatically ensures indexes on first call
 */
export async function insertAiRequestEvent(
  input: AiRequestEventInput
): Promise<ObjectId> {
  await ensureAiRequestEventIndexes();
  
  const collection = await getAiRequestEventsCollection();
  const now = new Date();
  
  const doc: Omit<AiRequestEventDocument, '_id'> = {
    ts: now,
    uid: input.uid,
    feature: input.feature,
    provider: input.provider,
    model: input.model,
    status: input.status,
    durationMs: input.durationMs ?? null,
    sessionId: input.sessionId,
    createdAt: now,
  };
  
  const result = await collection.insertOne(doc as AiRequestEventDocument);
  return result.insertedId;
}
