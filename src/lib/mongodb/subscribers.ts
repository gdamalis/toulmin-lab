import { COLLECTIONS } from "@/constants/database.constants";
import { SubscriberCollection } from "@/types/mongodb";
import { WithId } from "mongodb";
import { getCollection } from "./client";

// Find a subscriber by email
export async function findSubscriberByEmail(
  email: string
): Promise<WithId<SubscriberCollection> | null> {
  const collection = await getCollection<SubscriberCollection>(COLLECTIONS.SUBSCRIBERS);
  return collection.findOne({ email });
}

// Find all subscribers
export async function findAllSubscribers(): Promise<WithId<SubscriberCollection>[]> {
  const collection = await getCollection<SubscriberCollection>(COLLECTIONS.SUBSCRIBERS);
  return collection.find({}).sort({ createdAt: -1 }).toArray();
}

// Add a new subscriber
export async function addSubscriber(
  email: string
): Promise<WithId<SubscriberCollection> | null> {
  const collection = await getCollection<SubscriberCollection>(COLLECTIONS.SUBSCRIBERS);
  
  // Check if subscriber already exists
  const existingSubscriber = await findSubscriberByEmail(email);
  if (existingSubscriber) {
    return existingSubscriber;
  }

  const now = new Date();
  const subscriber: SubscriberCollection = {
    email,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(subscriber);
  
  if (!result.acknowledged) {
    throw new Error("Failed to add subscriber");
  }

  return findSubscriberByEmail(email);
}

// Delete a subscriber
export async function deleteSubscriber(email: string): Promise<boolean> {
  const collection = await getCollection<SubscriberCollection>(COLLECTIONS.SUBSCRIBERS);
  
  const result = await collection.deleteOne({ email });
  return result.deletedCount === 1;
} 