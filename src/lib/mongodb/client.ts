import { Collection, Document, MongoClient, ObjectId } from 'mongodb';
import { DB_NAME } from '@/constants/database.constants';
import clientPromise from './config';

let client: MongoClient | null = null;

export async function getMongoClient() {
  if (!client) {
    client = await clientPromise;
  }
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
  return new ObjectId(id);
} 