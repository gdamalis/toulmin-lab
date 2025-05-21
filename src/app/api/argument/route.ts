import { parseRequestBody } from "@/lib/api/middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { NextRequest } from "next/server";
import { ToulminArgument } from "@/types/client";
import { withAuth } from "@/lib/api/auth";
import { getUserArguments, createArgument } from "@/lib/services/arguments";

// Interface for argument creation request
interface CreateArgumentRequest {
  diagram: ToulminArgument;
}

// GET /api/arguments - Get all toulmin arguments for the authenticated user
export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAuth(async (_request, _context, auth) => {
    try {
      const result = await getUserArguments(auth.userId);

      if (!result.success) {
        return createErrorResponse(result.error || "Failed to fetch arguments", 500);
      }

      return createSuccessResponse(result.data);
    } catch (error) {
      console.error("Error fetching toulmin arguments:", error);
      return createErrorResponse("Internal Server Error", 500);
    }
  })(request, context);
}

// POST /api/arguments - Create a new toulmin argument
export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAuth(async (request, _context, auth) => {
    try {
      const data = await parseRequestBody<CreateArgumentRequest>(request);

      if (!data.diagram) {
        return createErrorResponse("Diagram data is required", 400);
      }

      const result = await createArgument(data.diagram, auth.userId);

      if (!result.success || !result.data) {
        return createErrorResponse(result.error || "Failed to create argument", 500);
      }

      return createSuccessResponse({
        id: result.data.id,
        diagram: data.diagram,
        userId: auth.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error creating argument:", error);
      return createErrorResponse("Internal Server Error", 500);
    }
  })(request, context);
}
