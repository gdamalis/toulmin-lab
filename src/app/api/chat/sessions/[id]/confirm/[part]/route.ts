import { NextRequest } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { parseRequestBody } from "@/lib/api/middleware";
import { confirmPartAndAdvance } from "@/lib/mongodb/chat-sessions";
import { ConfirmPartRequest } from "@/types/chat";
import { stepToPartName } from "@/lib/services/chat-ai";

/**
 * POST /api/chat/sessions/[id]/confirm/[part] - Confirm a part and advance
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
      
      const body = await parseRequestBody<ConfirmPartRequest>(request);
      
      if (!body?.confirmedText?.trim()) {
        return createErrorResponse("Confirmed text is required", 400);
      }
      
      // Map step name to part name
      const partName = stepToPartName(stepName as any);
      if (!partName) {
        return createErrorResponse("Invalid step name", 400);
      }
      
      // Execute transaction: update argument + advance session
      const result = await confirmPartAndAdvance(
        sessionId,
        auth.userId,
        partName,
        body.confirmedText
      );
      
      return createSuccessResponse({
        confirmed: true,
        argumentId: result.argumentId,
        nextStep: result.nextStep,
        part: partName
      });
      
    } catch (error) {
      console.error("Error confirming part:", error);
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to confirm",
        500
      );
    }
  })(request, context);
}

