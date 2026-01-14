import { NextRequest } from "next/server";
import { ToulminArgument } from "@/types/client";
import { withAuth } from "@/lib/api/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { getArgumentById, updateArgument, deleteArgument } from "@/lib/services/arguments";
import { validateUpdateArgument } from "@/lib/validation/argument";
import { logAppServerEvent, APP_SERVER_EVENT } from "@/lib/mongodb/collections/app-server-events";

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
    const { id } = await context.params;
    const argumentId = id as string; // Assert that id is a string
    
    try {
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
        logAppServerEvent({
          event: APP_SERVER_EVENT.ARGUMENT_UPDATE_ERROR,
          path: `/api/argument/${argumentId}`,
          method: 'PUT',
          statusCode: 400,
          result: 'error',
          errorType: result.error ?? 'update_failed',
        });
        return createErrorResponse(result.error || "Failed to update argument", 400);
      }

      logAppServerEvent({
        event: APP_SERVER_EVENT.ARGUMENT_UPDATE_SUCCESS,
        path: `/api/argument/${argumentId}`,
        method: 'PUT',
        statusCode: 200,
        result: 'success',
      });

      return createSuccessResponse({ success: true, toulminArgumentId: argumentId });
    } catch (error) {
      console.error("Error updating argument:", error);
      logAppServerEvent({
        event: APP_SERVER_EVENT.ARGUMENT_UPDATE_ERROR,
        path: `/api/argument/${argumentId}`,
        method: 'PUT',
        statusCode: 500,
        result: 'error',
        errorType: 'exception',
      });
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
    const { id } = await context.params;
    const argumentId = id as string; // Assert that id is a string
    
    try {
      const result = await deleteArgument(argumentId, auth.userId);
      
      if (!result.success) {
        logAppServerEvent({
          event: APP_SERVER_EVENT.ARGUMENT_DELETE_ERROR,
          path: `/api/argument/${argumentId}`,
          method: 'DELETE',
          statusCode: 404,
          result: 'error',
          errorType: result.error ?? 'delete_failed',
        });
        return createErrorResponse(result.error || "Failed to delete argument", 404);
      }
      
      logAppServerEvent({
        event: APP_SERVER_EVENT.ARGUMENT_DELETE_SUCCESS,
        path: `/api/argument/${argumentId}`,
        method: 'DELETE',
        statusCode: 200,
        result: 'success',
      });
      
      return createSuccessResponse({ success: true });
    } catch (error) {
      console.error('Error deleting argument:', error);
      logAppServerEvent({
        event: APP_SERVER_EVENT.ARGUMENT_DELETE_ERROR,
        path: `/api/argument/${argumentId}`,
        method: 'DELETE',
        statusCode: 500,
        result: 'error',
        errorType: 'exception',
      });
      return createErrorResponse("Internal server error", 500);
    }
  })(request, { params });
}
