import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { NextRequest } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { findUserById } from "@/lib/mongodb/service";

// GET /api/users/me - Get the current authenticated user
export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAuth(async (_request, _context, auth) => {
    try {
      const userId = auth.userId;
      const user = await findUserById(userId);
      
      if (!user) {
        return createErrorResponse("User not found", 404);
      }
      
      return createSuccessResponse({ user });
    } catch (error) {
      console.error("Error fetching current user:", error);
      return createErrorResponse("Internal Server Error", 500);
    }
  })(request, context);
}
