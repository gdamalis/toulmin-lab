import { COLLECTIONS, DB_NAME } from "@/constants/database.constants";
import { ToulminArgument } from "@/types/client";
import { ToulminArgumentCollection, UserCollection } from "@/types/mongodb";
import { toClientToulminArgument, toCollectionToulminArgument } from "@/utils/typeConverters";
import { Collection, Db, Document, ObjectId } from "mongodb";
import clientPromise from "./config";


// Helper function to get the database
const getDatabase = async (): Promise<Db> => {
  const client = await clientPromise;
  return client.db(DB_NAME);
};

// Helper function to get a collection
const getCollection = async <T extends Document>(
  collectionName: string
): Promise<Collection<T>> => {
  const db = await getDatabase();
  return db.collection<T>(collectionName);
};

// User operations
export const getUserById = async (userId: string): Promise<UserCollection | null> => {
  const collection = await getCollection<UserCollection & Document>(COLLECTIONS.USERS);
  return collection.findOne({ userId });
};

export const createOrUpdateUser = async (userData: {
  userId: string;
  name: string;
  email: string;
  picture?: string;
}): Promise<UserCollection> => {
  const collection = await getCollection<UserCollection & Document>(COLLECTIONS.USERS);

  const now = new Date();
  const user: UserCollection = {
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

// ToulminArgument operations
export const saveToulminArgument = async (
  clientArg: ToulminArgument,
  userId: string
): Promise<string> => {
  const collection = await getCollection<ToulminArgumentCollection & Document>(
    COLLECTIONS.ARGUMENTS
  );

  // Get the user
  const userCollection = await getCollection<UserCollection & Document>(COLLECTIONS.USERS);
  const user = await userCollection.findOne({ userId });
  if (!user) {
    throw new Error("User not found");
  }

  // Convert client argument to collection format
  const dbArg = toCollectionToulminArgument(clientArg);
  
  // Set the author with the proper ObjectId
  dbArg.author = {
    _id: user._id as ObjectId,
    userId: user.userId,
    name: user.name,
  };

  const result = await collection.insertOne(dbArg as ToulminArgumentCollection);
  return result.insertedId.toString();
};

export const getToulminArgumentsByUserId = async (
  userId: string
): Promise<ToulminArgument[]> => {
  const collection = await getCollection<ToulminArgumentCollection & Document>(
    COLLECTIONS.ARGUMENTS
  );
  
  const docs = await collection
    .find({ "author.userId": userId })
    .sort({ createdAt: -1 })
    .toArray();
  
  return docs.map(toClientToulminArgument);
};

export const getToulminArgumentById = async (id: string): Promise<ToulminArgument | null> => {
  const collection = await getCollection<ToulminArgumentCollection & Document>(
    COLLECTIONS.ARGUMENTS
  );
  
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  
  if (!doc) return null;
  
  return toClientToulminArgument(doc);
};

export const updateToulminArgument = async (
  id: string,
  clientArg: ToulminArgument,
  userId: string
): Promise<boolean> => {
  const collection = await getCollection<ToulminArgumentCollection & Document>(
    COLLECTIONS.ARGUMENTS
  );

  // Make sure the argument exists and belongs to the user
  const existingArg = await collection.findOne({
    _id: new ObjectId(id),
    "author.userId": userId
  });

  if (!existingArg) {
    throw new Error("Argument not found or not authorized to update");
  }

  // Convert client argument to collection format
  const dbArg = toCollectionToulminArgument(clientArg);
  
  // Update the author from existing document (don't modify the author)
  dbArg.author = existingArg.author;
  
  // Update updatedAt timestamp
  dbArg.updatedAt = new Date();

  // Update document
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: dbArg }
  );

  return result.modifiedCount === 1;
};
