import { NextRequest } from "next/server";
import { ToulminArgument } from "@/types/client";
import { withAuth } from "@/lib/api/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { getArgumentById, updateArgument, deleteArgument } from "@/lib/services/arguments";
import { validateUpdateArgument } from "@/lib/validation/argument";

// GET /api/argument/:id - Get a specific diagram by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (_request, context, auth) => {
    try {
      const { id } = await context.params;
      const argumentId = id as string; // Assert that id is a string
      
      const result = await getArgumentById(argumentId, auth.userId);

      if (!result.success) {
        return createErrorResponse(result.error || "ToulminArgument not found", 404);
      }

      return createSuccessResponse(result.data);
    } catch (error) {
      console.error("Error fetching argument:", error);
      return createErrorResponse("Internal Server Error", 500);
    }
  })(request, { params });
}

// PUT /api/argument/:id - Update a specific diagram by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (request, context, auth) => {
    try {
      const { id } = await context.params;
      const argumentId = id as string; // Assert that id is a string

      // Parse the request body
      const data = await request.json();

      // Validate request body
      const validation = validateUpdateArgument(data);
      if (!validation.success) {
        return createErrorResponse(
          `Invalid request data: ${validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          400
        );
      }

      const result = await updateArgument(argumentId, validation.data as ToulminArgument, auth.userId);

      if (!result.success) {
        return createErrorResponse(result.error || "Failed to update argument", 400);
      }

      return createSuccessResponse({ success: true, toulminArgumentId: argumentId });
    } catch (error) {
      console.error("Error updating argument:", error);
      return createErrorResponse(
        error instanceof Error ? error.message : "Internal Server Error",
        500
      );
    }
  })(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (_request, context, auth) => {
    try {
      const { id } = await context.params;
      const argumentId = id as string; // Assert that id is a string
      
      const result = await deleteArgument(argumentId, auth.userId);
      
      if (!result.success) {
        return createErrorResponse(result.error || "Failed to delete argument", 404);
      }
      
      return createSuccessResponse({ success: true });
    } catch (error) {
      console.error('Error deleting argument:', error);
      return createErrorResponse("Internal server error", 500);
    }
  })(request, { params });
}
