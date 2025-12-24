import { NextRequest } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { parseRequestBody } from "@/lib/api/middleware";
import { 
  createChatSession, 
  findChatSessionsByUserId,
  pauseActiveSessionsForUser,
  findActiveChatSessionForUser
} from "@/lib/mongodb/chat-sessions";
import { CreateChatSessionRequest } from "@/types/chat";
import { Locale } from "@/i18n/settings";

/**
 * GET /api/chat/sessions - Get all chat sessions for the authenticated user
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAuth(async (request, _context, auth) => {
    try {
      const sessions = await findChatSessionsByUserId(auth.userId);
      
      return createSuccessResponse({
        sessions,
        count: sessions.length
      });
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      return createErrorResponse("Failed to fetch chat sessions", 500);
    }
  })(request, context);
}

/**
 * POST /api/chat/sessions - Create a new chat session
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAuth(async (request, _context, auth) => {
    try {
      const body = await parseRequestBody<CreateChatSessionRequest>(request);
      
      // Validate request
      if (!body) {
        return createErrorResponse("Request body is required", 400);
      }

      // Check if user already has an active session
      const existingActiveSession = await findActiveChatSessionForUser(auth.userId);
      
      if (existingActiveSession) {
        // Pause the existing active session
        await pauseActiveSessionsForUser(auth.userId);
      }

      // Create new session
      const now = new Date();
      const sessionTitle = body.title || `Argument Session ${now.toLocaleDateString()}`;
      
      const newSession = {
        userId: auth.userId,
        title: sessionTitle,
        status: 'active' as const,
        currentStep: 'intro' as const,
        argumentProgress: {
          topic: body.initialTopic || undefined
        },
        drafts: {},
        suggestedActions: [],
        messages: [],
        language: (body.language as Locale) || 'en',
        createdAt: now,
        updatedAt: now
      };

      const sessionId = await createChatSession(newSession);

      const sessionWithId = {
        ...newSession,
        _id: sessionId
      };

      return createSuccessResponse(sessionWithId);
    } catch (error) {
      console.error("Error creating chat session:", error);
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to create chat session",
        500
      );
    }
  })(request, context);
}
