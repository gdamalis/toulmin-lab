import { parseRequestBody } from "@/lib/api/middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { createOrUpdateUser } from "@/lib/services/users";
import { UserInput } from "@/types/users";
import { NextRequest } from "next/server";
import { withAdminAuth } from "@/lib/api/auth";
import { Role } from "@/types/roles";
import { createFirebaseUser, setUserRole } from "@/lib/firebase/auth-admin";
import { validateCreateUser } from "@/lib/validation/users";
import { logger } from "@/lib/logger";

// User create request body interface
interface UserCreateRequestBody extends UserInput {
  role?: Role;
  password?: string; // Optional password - if not provided, a random one will be generated
}

// POST /api/users/create - Create a new user (admin only)
export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAdminAuth(async () => {
    try {
      const body = await parseRequestBody<UserCreateRequestBody>(request);
      
      // Validate request body
      const validation = validateCreateUser(body);
      if (!validation.success) {
        return createErrorResponse(
          `Invalid request data: ${validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          400
        );
      }

      const validatedData = validation.data;

      // 1. Create the user in Firebase first
      const firebaseResult = await createFirebaseUser(
        validatedData.email,
        validatedData.password,
        validatedData.name
      );

      if (!firebaseResult.success || !firebaseResult.user) {
        return createErrorResponse(
          firebaseResult.error ?? "Failed to create user in Firebase",
          400
        );
      }

      const userId = firebaseResult.user.uid;
      
      // 2. Set the user's role in Firebase
      if (validatedData.role) {
        await setUserRole(userId, validatedData.role);
      }
      
      // 3. Create or update the user in MongoDB
      const result = await createOrUpdateUser({
        name: validatedData.name,
        email: validatedData.email,
        picture: validatedData.picture,
        userId: userId,
        role: validatedData.role,
      });

      if (!result.success) {
        return createErrorResponse(
          result.error ?? "Failed to create user in database",
          400
        );
      }
      
      // 4. Return the user data with temp password if one was generated
      return createSuccessResponse({
        ...result.data,
        temporaryPassword: firebaseResult.temporaryPassword
      });
    } catch (error) {
      logger.error("Error in POST /api/users/create", error);
      return createErrorResponse("Invalid request", 400);
    }
  })(request, context);
} 