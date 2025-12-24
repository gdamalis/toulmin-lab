import { NextRequest } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { skipPartAndAdvance } from "@/lib/mongodb/chat-sessions";
import { stepToPartName } from "@/lib/services/chat-ai";

/**
 * POST /api/chat/sessions/[id]/skip/[part] - Skip a part and advance
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; part: string }> }
) {
  return withAuth(async (request, _context, auth) => {
    try {
      const params = await context.params;
      const sessionId = params.id;
      const stepName = params.part;
      
      // Map step name to part name
      const partName = stepToPartName(stepName as any);
      if (!partName) {
        return createErrorResponse("Invalid step name", 400);
      }
      
      // Execute transaction: write empty string + advance session
      const result = await skipPartAndAdvance(sessionId, auth.userId, partName);
      
      return createSuccessResponse({
        skipped: true,
        nextStep: result.nextStep,
        argumentId: result.argumentId,
        part: partName
      });
      
    } catch (error) {
      console.error("Error skipping part:", error);
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to skip",
        500
      );
    }
  })(request, context);
}

