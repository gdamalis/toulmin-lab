import { ToulminArgument } from "@/types/client";
import { NextRequest } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { createArgument } from "@/lib/services/arguments";

export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAuth(async (request, _context, auth) => {
    try {
      // Parse the request body
      const data = (await request.json()) as ToulminArgument;

      const result = await createArgument(data, auth.userId);

      if (!result.success || !result.data) {
        return createErrorResponse(result.error || "Failed to save diagram", 500);
      }

      return createSuccessResponse({ success: true, toulminArgumentId: result.data.id });
    } catch (error) {
      console.error("Error saving diagram:", error);
      return createErrorResponse("Failed to save diagram", 500);
    }
  })(request, context);
}
