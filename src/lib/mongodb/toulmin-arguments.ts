import { COLLECTIONS } from "@/constants/database.constants";
import { ToulminArgument } from "@/types/client";
import { ToulminArgumentCollection } from "@/types/mongodb";
import { ToulminArgumentPart } from "@/types/toulmin";
import { toClientToulminArgument, toCollectionToulminArgument } from "@/utils/typeConverters";
import { getCollection, toObjectId } from "./client";
import { findUserById } from "./users";
import { ObjectId, WithId } from "mongodb";
import clientPromise from "@/lib/mongodb/config";

// Create a new Toulmin argument
export async function createToulminArgument(
  argument: ToulminArgument,
  userId: string
): Promise<string> {
  const collection = await getCollection<ToulminArgumentCollection>(COLLECTIONS.ARGUMENTS);
  
  // Get the user
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Convert and prepare the argument
  const dbArg = toCollectionToulminArgument(argument);
  dbArg.author = {
    _id: user._id,
    userId: user.userId,
    name: user.name,
  };

  const result = await collection.insertOne(dbArg);
  return result.insertedId.toString();
}

// Find a Toulmin argument by ID
export async function findToulminArgumentById(
  id: string
): Promise<ToulminArgument | null> {
  const collection = await getCollection<ToulminArgumentCollection>(COLLECTIONS.ARGUMENTS);
  const result = await collection.findOne({ _id: toObjectId(id) });
  return result ? toClientToulminArgument(result) : null;
}

// Find a Toulmin argument by ID for a specific user
export async function findToulminArgumentByIdForUser(
  id: string,
  userId: string
): Promise<ToulminArgument | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const client = await clientPromise;
  const db = client.db("toulmin_lab");

  const result = await db
    .collection<ToulminArgumentCollection>(COLLECTIONS.ARGUMENTS)
    .findOne({
      _id: new ObjectId(id),
      "author.userId": userId,
    });
  
  return result ? toClientToulminArgument(result) : null;
}

// Find all Toulmin arguments by user ID
export async function findToulminArgumentsByUserId(
  userId: string
): Promise<ToulminArgument[]> {
  const collection = await getCollection<ToulminArgumentCollection>(COLLECTIONS.ARGUMENTS);
  const results = await collection
    .find({ "author.userId": userId })
    .sort({ createdAt: -1 })
    .toArray();
  
  return results.map(toClientToulminArgument);
}

// Find all raw Toulmin arguments by user ID (without converting to client format)
export async function findRawToulminArgumentsByUserId(
  userId: string
): Promise<WithId<ToulminArgumentCollection>[]> {
  const client = await clientPromise;
  const db = client.db("toulmin_lab");

  return db
    .collection<ToulminArgumentCollection>(COLLECTIONS.ARGUMENTS)
    .find({ "author.userId": userId })
    .sort({ createdAt: -1 })
    .toArray();
}

// Update a Toulmin argument
export async function updateToulminArgument(
  id: string,
  argument: ToulminArgument,
  userId: string
): Promise<boolean> {
  const collection = await getCollection<ToulminArgumentCollection>(COLLECTIONS.ARGUMENTS);

  // Verify ownership
  const existing = await collection.findOne({
    _id: toObjectId(id),
    "author.userId": userId
  });

  if (!existing) {
    throw new Error("Argument not found or not authorized to update");
  }

  // Convert and update
  const dbArg = toCollectionToulminArgument(argument);
  dbArg.author = existing.author; // Preserve original author
  dbArg.updatedAt = new Date();

  const result = await collection.updateOne(
    { _id: toObjectId(id) },
    { $set: dbArg }
  );

  return result.modifiedCount === 1;
}

// Delete a Toulmin argument
export async function deleteToulminArgument(
  id: string,
  userId: string
): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    return false;
  }
  
  const client = await clientPromise;
  const db = client.db("toulmin_lab");
  
  // Delete the argument if it belongs to the authenticated user
  const result = await db
    .collection(COLLECTIONS.ARGUMENTS)
    .deleteOne({
      _id: new ObjectId(id),
      'author.userId': userId // Only delete if the argument belongs to this user
    });
  
  return result.deletedCount === 1;
}

/**
 * Update a single part of a Toulmin argument
 */
export async function updateToulminArgumentPart(
  id: string,
  partName: keyof ToulminArgumentPart,
  partValue: string,
  userId: string
): Promise<boolean> {
  const collection = await getCollection<ToulminArgumentCollection>(COLLECTIONS.ARGUMENTS);
  
  // Verify ownership
  const existing = await collection.findOne({
    _id: toObjectId(id),
    "author.userId": userId
  });
  
  if (!existing) {
    throw new Error("Argument not found or not authorized");
  }
  
  const result = await collection.updateOne(
    { _id: toObjectId(id) },
    { 
      $set: { 
        [`parts.${partName}`]: partValue,
        updatedAt: new Date()
      }
    }
  );
  
  return result.modifiedCount === 1;
}

/**
 * Create an empty Toulmin argument (for incremental building)
 */
export async function createEmptyToulminArgument(
  title: string,
  userId: string
): Promise<string> {
  const collection = await getCollection<ToulminArgumentCollection>(COLLECTIONS.ARGUMENTS);
  
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  
  const emptyArgument: Omit<ToulminArgumentCollection, '_id'> = {
    name: title,
    author: {
      _id: user._id,
      userId: user.userId,
      name: user.name,
    },
    parts: {
      claim: '',
      grounds: '',
      groundsBacking: '',
      warrant: '',
      warrantBacking: '',
      qualifier: '',
      rebuttal: ''
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await collection.insertOne(emptyArgument as ToulminArgumentCollection);
  return result.insertedId.toString();
}

// Get analytics data
export async function getToulminArgumentAnalytics(): Promise<{
  totalDiagrams: number;
  totalDiagramsChange: number;
}> {
  const collection = await getCollection<ToulminArgumentCollection>(COLLECTIONS.ARGUMENTS);
  
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const [lastWeekCount, previousWeekCount] = await Promise.all([
    collection.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    }),
    collection.countDocuments({
      createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo }
    })
  ]);

  return {
    totalDiagrams: lastWeekCount + previousWeekCount,
    totalDiagramsChange: lastWeekCount - previousWeekCount
  };
} 