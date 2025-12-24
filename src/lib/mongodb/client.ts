import { Collection, Document, MongoClient, ObjectId } from 'mongodb';
import { DB_NAME } from '@/constants/database.constants';
import clientPromise from './config';

let client: MongoClient | null = null;

export async function getMongoClient() {
  client ??= await clientPromise;
  return client;
}

export async function getCollection<T extends Document>(
  collectionName: string
): Promise<Collection<T>> {
  const client = await getMongoClient();
  return client.db(DB_NAME).collection<T>(collectionName);
}

// Helper for converting string IDs to ObjectIds
export function toObjectId(id: string) {
  if (!id || typeof id !== 'string') {
    throw new Error(`Invalid ObjectId: ${id}. Expected a non-empty string.`);
  }
  
  if (!ObjectId.isValid(id)) {
    throw new Error(`Invalid ObjectId format: ${id}. Must be a 24 character hex string.`);
  }
  
  return new ObjectId(id);
} 