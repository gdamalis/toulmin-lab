import { NextRequest } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { 
  findChatSessionByIdForUser,
  updateChatSessionStatus,
  updateChatSessionProgress
} from "@/lib/mongodb/chat-sessions";

/**
 * POST /api/chat/sessions/[id]/complete - Mark session as complete
 * Note: Argument is already built incrementally through confirm/skip actions
 */
export async function POST(
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

      // Verify session belongs to user
      const session = await findChatSessionByIdForUser(sessionId, auth.userId);
      if (!session) {
        return createErrorResponse("Chat session not found", 404);
      }

      if (session.status === 'completed') {
        return createErrorResponse("Session is already completed", 400);
      }

      if (!session.generatedArgumentId) {
        return createErrorResponse("No argument created yet", 400);
      }

      // Mark session as completed
      await updateChatSessionStatus(sessionId, 'completed');
      await updateChatSessionProgress(sessionId, 'done', session.argumentProgress);

      return createSuccessResponse({
        completed: true,
        argumentId: session.generatedArgumentId,
        sessionId,
        message: "Session completed successfully"
      });

    } catch (error) {
      console.error("Error completing chat session:", error);
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to complete session",
        500
      );
    }
  })(request, context);
}
