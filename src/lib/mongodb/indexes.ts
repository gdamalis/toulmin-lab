/**
 * MongoDB Index Management
 * 
 * This file defines and creates indexes for all collections to optimize query performance.
 * Run this script once during deployment or database setup.
 * 
 * Usage:
 *   npx tsx src/lib/mongodb/indexes.ts
 */

import { getCollection } from './client';
import { COLLECTIONS } from '@/constants/database.constants';

/**
 * Create indexes for the users collection
 */
async function createUserIndexes() {
  const collection = await getCollection(COLLECTIONS.USERS);
  
  // Unique index on userId for fast lookups and ensuring uniqueness
  await collection.createIndex(
    { userId: 1 },
    { unique: true, name: 'userId_unique' }
  );
  
  // Index for sorting by creation date
  await collection.createIndex(
    { createdAt: -1 },
    { name: 'createdAt_desc' }
  );
  
  console.log('✓ User indexes created');
}

/**
 * Create indexes for the arguments collection
 */
async function createArgumentIndexes() {
  const collection = await getCollection(COLLECTIONS.ARGUMENTS);
  
  // Compound index for finding user's arguments sorted by date
  await collection.createIndex(
    { 'author.userId': 1, createdAt: -1 },
    { name: 'author_userId_createdAt' }
  );
  
  // Index for sorting all arguments by creation date
  await collection.createIndex(
    { createdAt: -1 },
    { name: 'createdAt_desc' }
  );
  
  console.log('✓ Argument indexes created');
}

/**
 * Create indexes for coach sessions collection
 */
async function createCoachSessionIndexes() {
  const collection = await getCollection(COLLECTIONS.COACH_SESSIONS);
  
  // Compound index for finding user's sessions sorted by last update
  await collection.createIndex(
    { userId: 1, updatedAt: -1 },
    { name: 'userId_updatedAt' }
  );
  
  // Index for finding sessions by status
  await collection.createIndex(
    { userId: 1, status: 1 },
    { name: 'userId_status' }
  );
  
  console.log('✓ Coach session indexes created');
}

/**
 * Create indexes for coach messages collection
 */
async function createCoachMessageIndexes() {
  const collection = await getCollection(COLLECTIONS.COACH_MESSAGES);
  
  // Compound index for finding messages by session sorted by date
  await collection.createIndex(
    { sessionId: 1, createdAt: 1 },
    { name: 'sessionId_createdAt' }
  );
  
  console.log('✓ Coach message indexes created');
}

/**
 * Create indexes for argument drafts collection
 */
async function createArgumentDraftIndexes() {
  const collection = await getCollection(COLLECTIONS.ARGUMENT_DRAFTS);
  
  // Unique compound index for sessionId and userId
  await collection.createIndex(
    { sessionId: 1, userId: 1 },
    { unique: true, name: 'sessionId_userId_unique' }
  );
  
  // Index for finding user's drafts
  await collection.createIndex(
    { userId: 1, updatedAt: -1 },
    { name: 'userId_updatedAt' }
  );
  
  console.log('✓ Argument draft indexes created');
}

/**
 * Create indexes for coach usage tracking
 */
async function createCoachUsageIndexes() {
  const collection = await getCollection(COLLECTIONS.COACH_USAGE);
  
  // Compound index for finding usage by user and month
  await collection.createIndex(
    { userId: 1, month: 1 },
    { unique: true, name: 'userId_month_unique' }
  );
  
  console.log('✓ Coach usage indexes created');
}

/**
 * Create indexes for AI request events (analytics)
 */
async function createAIRequestEventIndexes() {
  const collection = await getCollection(COLLECTIONS.AI_REQUEST_EVENTS);
  
  // Compound index for querying events by user and timestamp
  await collection.createIndex(
    { uid: 1, timestamp: -1 },
    { name: 'uid_timestamp' }
  );
  
  // Index for querying by feature
  await collection.createIndex(
    { feature: 1, timestamp: -1 },
    { name: 'feature_timestamp' }
  );
  
  // Index for querying by status
  await collection.createIndex(
    { status: 1, timestamp: -1 },
    { name: 'status_timestamp' }
  );
  
  console.log('✓ AI request event indexes created');
}

/**
 * Main function to create all indexes
 */
export async function createAllIndexes() {
  console.log('Creating MongoDB indexes...\n');
  
  try {
    await createUserIndexes();
    await createArgumentIndexes();
    await createCoachSessionIndexes();
    await createCoachMessageIndexes();
    await createArgumentDraftIndexes();
    await createCoachUsageIndexes();
    await createAIRequestEventIndexes();
    
    console.log('\n✓ All indexes created successfully!');
    return { success: true };
  } catch (error) {
    console.error('\n✗ Error creating indexes:', error);
    return { success: false, error };
  }
}

// Run if executed directly
if (require.main === module) {
  createAllIndexes()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
