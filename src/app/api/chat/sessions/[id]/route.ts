import { NextRequest } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { parseRequestBody } from "@/lib/api/middleware";
import { 
  findChatSessionByIdForUser,
  updateChatSession,
  deleteChatSession
} from "@/lib/mongodb/chat-sessions";

/**
 * GET /api/chat/sessions/[id] - Get specific chat session
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (request, _context, auth) => {
    try {
      const params = await context.params;
      const sessionId = params.id;

      if (!sessionId) {
        return createErrorResponse("Session ID is required", 400);
      }

      const session = await findChatSessionByIdForUser(sessionId, auth.userId);

      if (!session) {
        return createErrorResponse("Chat session not found", 404);
      }

      return createSuccessResponse({ session });
    } catch (error) {
      console.error("Error fetching chat session:", error);
      return createErrorResponse("Failed to fetch chat session", 500);
    }
  })(request, context);
}

/**
 * PUT /api/chat/sessions/[id] - Update chat session
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (request, _context, auth) => {
    try {
      const params = await context.params;
      const sessionId = params.id;
      const updates = await parseRequestBody(request);

      if (!sessionId) {
        return createErrorResponse("Session ID is required", 400);
      }

      if (!updates) {
        return createErrorResponse("Update data is required", 400);
      }

      // Verify session belongs to user
      const existingSession = await findChatSessionByIdForUser(sessionId, auth.userId);
      if (!existingSession) {
        return createErrorResponse("Chat session not found", 404);
      }

      // Update session
      const success = await updateChatSession(sessionId, updates);

      if (!success) {
        return createErrorResponse("Failed to update chat session", 500);
      }

      // Fetch updated session
      const updatedSession = await findChatSessionByIdForUser(sessionId, auth.userId);

      return createSuccessResponse({ 
        session: updatedSession,
        updated: true 
      });
    } catch (error) {
      console.error("Error updating chat session:", error);
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to update chat session",
        500
      );
    }
  })(request, context);
}

/**
 * DELETE /api/chat/sessions/[id] - Delete chat session
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (request, _context, auth) => {
    try {
      const params = await context.params;
      const sessionId = params.id;

      if (!sessionId) {
        return createErrorResponse("Session ID is required", 400);
      }

      // Verify session belongs to user before deletion
      const existingSession = await findChatSessionByIdForUser(sessionId, auth.userId);
      if (!existingSession) {
        return createErrorResponse("Chat session not found", 404);
      }

      const success = await deleteChatSession(sessionId, auth.userId);

      if (!success) {
        return createErrorResponse("Failed to delete chat session", 500);
      }

      return createSuccessResponse({ 
        deleted: true,
        sessionId 
      });
    } catch (error) {
      console.error("Error deleting chat session:", error);
      return createErrorResponse("Failed to delete chat session", 500);
    }
  })(request, context);
}
