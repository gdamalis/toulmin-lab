import { COLLECTIONS } from "@/constants/database.constants";
import { UserCollection } from "@/types/mongodb";
import { Role } from "@/types/roles";
import { WithId } from "mongodb";
import { getCollection } from "./client";
import { setUserRole } from "@/lib/firebase/auth-admin";

// Find a user by their ID
export async function findUserById(
  userId: string
): Promise<WithId<UserCollection> | null> {
  const collection = await getCollection<UserCollection>(COLLECTIONS.USERS);
  return collection.findOne({ userId });
}

// Find all users
export async function findAllUsers(): Promise<WithId<UserCollection>[]> {
  const collection = await getCollection<UserCollection>(COLLECTIONS.USERS);
  return collection.find({}).sort({ createdAt: -1 }).toArray();
}

// Create or update a user
export async function createOrUpdateUser(userData: {
  userId: string;
  name: string;
  email: string;
  picture?: string;
  role?: Role;
}): Promise<WithId<UserCollection>> {
  const collection = await getCollection<UserCollection>(COLLECTIONS.USERS);
  
  const now = new Date();
  const existingUser = await findUserById(userData.userId);
  
  const user: UserCollection = {
    userId: userData.userId,
    name: userData.name,
    email: userData.email,
    picture: userData.picture,
    role: userData.role ?? (existingUser?.role ?? Role.USER),
    createdAt: existingUser?.createdAt ?? now,
    updatedAt: now,
  };

  // Set the role in Firebase custom claims
  await setUserRole(userData.userId, user.role);

  const result = await collection.findOneAndUpdate(
    { userId: userData.userId },
    { $set: user },
    { upsert: true, returnDocument: 'after' }
  );

  if (!result) {
    throw new Error("Failed to create/update user");
  }

  return result;
}

// Update user role
export async function updateUserRole(userId: string, role: Role): Promise<WithId<UserCollection>> {
  const collection = await getCollection<UserCollection>(COLLECTIONS.USERS);
  
  // Set the role in Firebase custom claims
  await setUserRole(userId, role);
  
  const result = await collection.findOneAndUpdate(
    { userId },
    { 
      $set: { 
        role,
        updatedAt: new Date()
      } 
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new Error("Failed to update user role");
  }

  return result;
}

// Delete a user
export async function deleteUser(userId: string): Promise<boolean> {
  const collection = await getCollection<UserCollection>(COLLECTIONS.USERS);
  
  const result = await collection.deleteOne({ userId });
  return result.deletedCount === 1;
}

// Get user analytics
export async function getUserAnalytics(): Promise<{
  totalUsers: number;
  totalUsersChange: number;
}> {
  const collection = await getCollection<UserCollection>(COLLECTIONS.USERS);
  
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
    totalUsers: lastWeekCount + previousWeekCount,
    totalUsersChange: lastWeekCount - previousWeekCount
  };
} 