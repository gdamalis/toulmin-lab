import { Collection, Document, ObjectId } from 'mongodb';
import { getCollection } from '../client';
import { COLLECTIONS, COACH_DATA_TTL_SECONDS } from '@/constants/database.constants';

/**
 * Server-truth outcome event types
 * These are reliable events that capture actual API outcomes,
 * even when client tracking (GA4) is blocked
 */
export const APP_SERVER_EVENT = {
  ARGUMENT_CREATE_SUCCESS: 'argument.create_success',
  ARGUMENT_CREATE_ERROR: 'argument.create_error',
  ARGUMENT_UPDATE_SUCCESS: 'argument.update_success',
  ARGUMENT_UPDATE_ERROR: 'argument.update_error',
  ARGUMENT_DELETE_SUCCESS: 'argument.delete_success',
  ARGUMENT_DELETE_ERROR: 'argument.delete_error',
} as const;

export type AppServerEvent = typeof APP_SERVER_EVENT[keyof typeof APP_SERVER_EVENT];

/**
 * Shape of an app server event document in MongoDB
 * Fully anonymous - no userId or email stored
 */
export interface AppServerEventDocument extends Document {
  _id?: ObjectId;
  /** Timestamp of the event */
  ts: Date;
  /** Event name */
  event: AppServerEvent;
  /** HTTP path (e.g., /api/argument) */
  path: string;
  /** HTTP method (GET, POST, PUT, DELETE) */
  method: string;
  /** HTTP status code */
  statusCode: number;
  /** Result type (success, error) */
  result: 'success' | 'error';
  /** Optional error type for failures */
  errorType?: string;
  /** Optional session hint (if provided by client) */
  sessionHint?: string;
  /** Created at timestamp (used for TTL) */
  createdAt: Date;
}

/**
 * Input for creating an app server event
 */
export interface AppServerEventInput {
  event: AppServerEvent;
  path: string;
  method: string;
  statusCode: number;
  result: 'success' | 'error';
  errorType?: string;
  sessionHint?: string;
}

/**
 * Get the app server events collection
 */
export async function getAppServerEventsCollection(): Promise<Collection<AppServerEventDocument>> {
  return getCollection<AppServerEventDocument>(COLLECTIONS.APP_SERVER_EVENTS);
}

/**
 * Promise to ensure indexes are created exactly once per runtime
 */
let indexesEnsured: Promise<void> | null = null;

/**
 * Ensure all app server event indexes are created
 * This is called automatically by the first insert operation
 */
export async function ensureAppServerEventIndexes(): Promise<void> {
  if (indexesEnsured) {
    return indexesEnsured;
  }

  indexesEnsured = (async () => {
    const collection = await getAppServerEventsCollection();

    await Promise.all([
      // TTL index: auto-delete after 30 days (matches other analytics retention)
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
      // Query index for event type filtering
      collection.createIndex(
        { event: 1, ts: -1 },
        { background: true, name: 'idx_event_ts' }
      ),
      // Query index for path filtering
      collection.createIndex(
        { path: 1, ts: -1 },
        { background: true, name: 'idx_path_ts' }
      ),
    ]);

    console.log('App server event indexes ensured');
  })();

  return indexesEnsured;
}

/**
 * Insert a single app server event
 * Automatically ensures indexes on first call
 * 
 * This is a fire-and-forget operation that does not block the calling code.
 */
export function logAppServerEvent(input: AppServerEventInput): void {
  // Fire-and-forget: don't await, don't block the caller
  (async () => {
    try {
      await ensureAppServerEventIndexes();
      
      const collection = await getAppServerEventsCollection();
      const now = new Date();
      
      const doc: Omit<AppServerEventDocument, '_id'> = {
        ts: now,
        event: input.event,
        path: input.path,
        method: input.method,
        statusCode: input.statusCode,
        result: input.result,
        errorType: input.errorType,
        sessionHint: input.sessionHint,
        createdAt: now,
      };
      
      await collection.insertOne(doc as AppServerEventDocument);
    } catch (error) {
      // Log but don't throw - analytics should never break the main flow
      console.error('[logAppServerEvent] Failed to log server event:', error);
    }
  })();
}
