import { COLLECTIONS } from "@/constants/database.constants";
import { ToulminArgument } from "@/types/client";
import { ToulminArgumentInput } from "@/types/toulmin";
import { ToulminArgumentCollection } from "@/types/mongodb";
import { toClientToulminArgument, toCollectionToulminArgument, toCollectionToulminArgumentInput } from "@/utils/typeConverters";
import { getCollection, toObjectId } from "./client";
import { findUserById } from "./users";
import { ObjectId, WithId } from "mongodb";

// Create a new Toulmin argument
export async function createToulminArgument(
  argument: ToulminArgumentInput,
  userId: string
): Promise<string> {
  const collection = await getCollection<ToulminArgumentCollection>(COLLECTIONS.ARGUMENTS);
  
  // Get the user
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Convert and prepare the argument
  const dbArg: Omit<ToulminArgumentCollection, "_id"> = {
    ...toCollectionToulminArgumentInput(argument),
    author: {
      _id: user._id,
      userId: user.userId,
      name: user.name,
    },
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

  const collection = await getCollection<ToulminArgumentCollection>(COLLECTIONS.ARGUMENTS);

  const result = await collection.findOne({
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
  const collection = await getCollection<ToulminArgumentCollection>(COLLECTIONS.ARGUMENTS);

  return collection
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
  
  const collection = await getCollection<ToulminArgumentCollection>(COLLECTIONS.ARGUMENTS);
  
  // Delete the argument if it belongs to the authenticated user
  const result = await collection.deleteOne({
    _id: new ObjectId(id),
    'author.userId': userId // Only delete if the argument belongs to this user
  });
  
  return result.deletedCount === 1;
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