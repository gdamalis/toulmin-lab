import { Db, Collection, ObjectId, Document } from 'mongodb';
import clientPromise from './config';
import { DBArgument, DBUser } from '@/types/mongodb';
import { ToulminArgument } from '@/types/toulmin';

// Database and collection names
const DB_NAME = 'toulmin_lab';
const COLLECTIONS = {
  ARGUMENTS: 'arguments',
  USERS: 'users',
};

// Helper function to get the database
const getDatabase = async (): Promise<Db> => {
  const client = await clientPromise;
  return client.db(DB_NAME);
};

// Helper function to get a collection
const getCollection = async <T extends Document>(collectionName: string): Promise<Collection<T>> => {
  const db = await getDatabase();
  return db.collection<T>(collectionName);
};

// User operations
export const getUserById = async (userId: string): Promise<DBUser | null> => {
  const collection = await getCollection<DBUser & Document>(COLLECTIONS.USERS);
  return collection.findOne({ userId });
};

export const createOrUpdateUser = async (userData: {
  userId: string;
  name: string;
  email: string;
  picture?: string;
}): Promise<DBUser> => {
  const collection = await getCollection<DBUser & Document>(COLLECTIONS.USERS);
  
  const now = new Date();
  const user: DBUser = {
    userId: userData.userId,
    name: userData.name,
    email: userData.email,
    picture: userData.picture,
    createdAt: now,
    updatedAt: now,
  };
  
  await collection.updateOne(
    { userId: userData.userId },
    { $set: { ...user } },
    { upsert: true }
  );
  
  return user;
};

// Argument operations
export const saveArgument = async (userId: string, argument: ToulminArgument): Promise<string> => {
  const collection = await getCollection<DBArgument & Document>(COLLECTIONS.ARGUMENTS);
  
  const now = new Date();
  const dbArgument: DBArgument = {
    userId,
    argument,
    createdAt: now,
    updatedAt: now,
  };
  
  const result = await collection.insertOne(dbArgument);
  return result.insertedId.toString();
};

export const getArgumentsByUserId = async (userId: string): Promise<DBArgument[]> => {
  const collection = await getCollection<DBArgument & Document>(COLLECTIONS.ARGUMENTS);
  return collection.find({ userId }).sort({ createdAt: -1 }).toArray();
};

export const getArgumentById = async (id: string): Promise<DBArgument | null> => {
  const collection = await getCollection<DBArgument & Document>(COLLECTIONS.ARGUMENTS);
  return collection.findOne({ _id: new ObjectId(id) });
}; 