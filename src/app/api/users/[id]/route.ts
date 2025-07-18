import { parseRequestBody } from "@/lib/api/middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { 
  findUserWithArguments, 
  updateUserRole as serviceUpdateRole, 
  deleteUser 
} from "@/lib/services/users";
import { Role } from "@/types/roles";
import { NextRequest } from "next/server";
import { withAuth, withAdminAuth, ensureSelfOrAdmin } from "@/lib/api/auth";
import { deleteFirebaseUser } from "@/lib/firebase/auth-admin";

// Role update request body interface
interface RoleUpdateRequest {
  role: Role;
}

// GET /api/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (_request, context, auth) => {
    try {
      const { id } = await context.params;
      const userId = id as string; // Assert that id is a string

      // Users can only access their own data unless they're an admin
      if (!ensureSelfOrAdmin(userId, auth)) {
        return createErrorResponse("Access denied", 403);
      }

      const result = await findUserWithArguments(userId);

      if (!result.success) {
        return createErrorResponse(result.error || "User not found", 404);
      }

      return createSuccessResponse(result.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      return createErrorResponse("Internal Server Error", 500);
    }
  })(request, { params });
}

// PATCH /api/users/[id] - Update a user's role (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(async (request, context) => {
    try {
      const { id } = await context.params;
      const userId = id as string; // Assert that id is a string

      // Parse the request body
      const body = await parseRequestBody<RoleUpdateRequest>(request);
      
      // Update the user's role
      const result = await serviceUpdateRole(userId, body.role);

      if (!result.success) {
        return createErrorResponse(result.error || "Failed to update user role", 400);
      }

      return createSuccessResponse(result.data);
    } catch (error) {
      console.error("Error updating user role:", error);
      return createErrorResponse("Invalid request", 400);
    }
  })(request, { params });
}

// DELETE /api/users/:id - Delete a user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(async () => {
    try {
      const { id } = await params;
      
      if (!id) {
        return createErrorResponse("User ID is required", 400);
      }

      // 1. Delete user from Firebase first
      const firebaseResult = await deleteFirebaseUser(id);
      
      if (!firebaseResult.success) {
        return createErrorResponse(
          firebaseResult.error ?? "Failed to delete user from Firebase",
          400
        );
      }

      // 2. Delete from MongoDB
      const result = await deleteUser(id);

      if (!result.success) {
        return createErrorResponse(
          result.error ?? "Failed to delete user from database",
          400
        );
      }

      return createSuccessResponse({ success: true });
    } catch (error) {
      console.error("Error in DELETE /api/users/[id]:", error);
      return createErrorResponse("Failed to delete user", 500);
    }
  })(request, { params: Promise.resolve(params) });
}
