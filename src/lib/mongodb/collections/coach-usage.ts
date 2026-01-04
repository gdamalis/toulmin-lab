import { Collection, Document } from 'mongodb';
import { getCollection } from '../client';
import { COLLECTIONS } from '@/constants/database.constants';

/**
 * Shape of a coach usage document in MongoDB
 */
export interface CoachUsageDocument extends Document {
  _id?: string;
  userId: string;
  monthKey: string; // UTC YYYY-MM
  used: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get the coach usage collection
 */
export async function getCoachUsageCollection(): Promise<Collection<CoachUsageDocument>> {
  return getCollection<CoachUsageDocument>(COLLECTIONS.COACH_USAGE);
}

/**
 * Promise to ensure indexes are created exactly once per runtime
 */
let indexesEnsured: Promise<void> | null = null;

/**
 * Ensure all coach usage indexes are created
 * This is called automatically by quota operations
 */
export async function ensureCoachUsageIndexes(): Promise<void> {
  if (indexesEnsured) {
    return indexesEnsured;
  }

  indexesEnsured = (async () => {
    const collection = await getCoachUsageCollection();

    await Promise.all([
      // Unique index on userId + monthKey for atomic operations
      collection.createIndex(
        { userId: 1, monthKey: 1 },
        { unique: true, background: true }
      ),
      // Index for cleanup/reporting queries
      collection.createIndex(
        { updatedAt: 1 },
        { background: true }
      ),
    ]);

    console.log('Coach usage indexes ensured');
  })();

  return indexesEnsured;
}

