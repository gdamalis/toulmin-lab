import {
  createOrUpdateUser as dbCreateOrUpdateUser,
  deleteUser as dbDeleteUser,
  findToulminArgumentsByUserId,
  findUserById,
  updateUserRole as dbUpdateUserRole,
} from "@/lib/mongodb/service";
import { Role } from "@/types/roles";
import { UserInput } from "@/types/users";

/**
 * Finds a user by ID and their associated arguments
 */
export async function findUserWithArguments(userId: string) {
  const [user, userArguments] = await Promise.all([
    findUserById(userId),
    findToulminArgumentsByUserId(userId),
  ]);

  if (!user) {
    return { success: false, error: "User not found" };
  }

  return { 
    success: true, 
    data: {
      user,
      arguments: userArguments,
    }
  };
}

/**
 * Creates or updates a user
 */
export async function createOrUpdateUser(userData: UserInput & { userId: string, picture?: string }) {
  try {
    const existingUser = await findUserById(userData.userId);
    
    const user = await dbCreateOrUpdateUser({
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      picture: userData.picture,
      role: existingUser?.role,
    });

    return { 
      success: true, 
      data: { user } 
    };
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return { 
      success: false, 
      error: "Failed to create/update user" 
    };
  }
}

/**
 * Updates a user's role
 */
export async function updateUserRole(userId: string, role: Role) {
  try {
    const updatedUser = await dbUpdateUserRole(userId, role);
    
    return { 
      success: true, 
      data: { user: updatedUser } 
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { 
      success: false, 
      error: "Failed to update user role" 
    };
  }
}

/**
 * Deletes a user by ID
 */
export async function deleteUser(userId: string) {
  try {
    const success = await dbDeleteUser(userId);
    
    if (!success) {
      return { 
        success: false, 
        error: "User not found" 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { 
      success: false, 
      error: "Failed to delete user" 
    };
  }
} 