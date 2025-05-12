import { 
  findUserWithArguments, 
  createOrUpdateUser as serviceCreateOrUpdateUser, 
  updateUserRole as serviceUpdateUserRole,
  deleteUser as serviceDeleteUser
} from "@/lib/services/users";
import { validateUserInput, validateRoleUpdate } from "@/lib/validation";
import { verifyToken } from "@/lib/auth/firebase";
import { Role } from "@/types/roles";
import { formatUserData } from "@/types/users";

/**
 * Get a user by ID with their arguments
 */
export async function getUser(userId: string) {
  return findUserWithArguments(userId);
}

/**
 * Verify a token and ensure it matches the user ID
 */
export async function verifyTokenForUser(token: string, userId: string) {
  const tokenResult = await verifyToken(token);
  
  if (!tokenResult.success || !tokenResult.token) {
    return { success: false, error: tokenResult.error ?? "Invalid token" };
  }
  
  // For security, verify that the token UID matches the requested userId
  if (tokenResult.token.uid !== userId) {
    return { success: false, error: "Token UID does not match requested userId" };
  }
  
  return { 
    success: true, 
    isAdmin: tokenResult.token.role === Role.ADMINISTRATOR,
    userId: tokenResult.token.uid,
  };
}

/**
 * Create or update a user
 */
export async function createOrUpdateUser(body: unknown, token: string) {
  // Validate input
  const validation = validateUserInput(body);
  if (!validation.isValid) {
    return { success: false, error: validation.error ?? "Invalid input" };
  }
  
  const { userId, name, email, picture } = body as { 
    userId: string;
    name: string;
    email: string;
    picture?: string;
  };
  
  // Verify token
  const authResult = await verifyTokenForUser(token, userId);
  if (!authResult.success) {
    return authResult;
  }
  
  // Get existing user to check permissions
  const existingUserResult = await findUserWithArguments(userId);
  const existingUser = existingUserResult.success ? existingUserResult.data?.user : null;
  
  // Only allow modifications to other users if admin
  if (existingUser && existingUser.userId !== userId && !authResult.isAdmin) {
    return { success: false, error: "Cannot update other users without admin privileges" };
  }
  
  // Create or update the user
  const result = await serviceCreateOrUpdateUser({
    userId,
    name,
    email,
    picture
  });
  
  if (!result.success || !result.data) {
    return { success: false, error: result.error || "Failed to create user" };
  }
  
  return {
    success: true,
    data: {
      user: formatUserData(result.data.user),
    }
  };
}

/**
 * Update a user's role
 */
export async function updateUserRole(body: unknown) {
  // Validate role update input
  const validation = validateRoleUpdate(body);
  if (!validation.isValid) {
    return { 
      success: false, 
      error: validation.error ?? "Invalid input: userId and valid role are required" 
    };
  }
  
  const { userId, role } = body as { userId: string; role: Role };
  
  // Update user role
  return serviceUpdateUserRole(userId, role);
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string) {
  return serviceDeleteUser(userId);
} 