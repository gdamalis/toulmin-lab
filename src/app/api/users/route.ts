import { parseRequestBody } from "@/lib/api/middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { findAllUsers, createOrUpdateUser } from "@/lib/services/users";
import { UserInput } from "@/types/users";
import { NextRequest } from "next/server";
import { withAdminAuth, withAuth } from "@/lib/api/auth";
import { Role } from "@/types/roles";

// User create/update request body interface
interface UserRequestBody extends UserInput {
  userId: string;
  role?: Role;
}

// GET /api/users - Get all users (admin only)
export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAdminAuth(async () => {
    try {
      // Get all users from the service
      const result = await findAllUsers();

      if (!result.success) {
        return createErrorResponse(result.error ?? "Failed to fetch users", 500);
      }

      return createSuccessResponse(result.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      return createErrorResponse("Internal Server Error", 500);
    }
  })(request, context);
}

// POST /api/users - Create a new user
export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAuth(async (request, _context, auth) => {
    try {
      const body = await parseRequestBody<UserRequestBody>(request);
      
      // The userId should match the authenticated user's ID
      if (body.userId !== auth.userId) {
        return createErrorResponse("Cannot create or update other user accounts", 403);
      }

      const result = await createOrUpdateUser(body);

      if (!result.success) {
        return createErrorResponse(
          result.error ?? "Failed to create user",
          400
        );
      }

      return createSuccessResponse(result.data);
    } catch (error) {
      console.error("Error in POST /api/users:", error);
      return createErrorResponse("Invalid request", 400);
    }
  })(request, context);
}
