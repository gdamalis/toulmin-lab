import { createErrorResponse, createSuccessResponse } from "@/lib/api/responses";
import { withAdminAuth } from "@/lib/api/auth";
import { deleteSubscriber, findSubscriberByEmail } from "@/lib/mongodb/subscribers";
import { NextRequest } from "next/server";

// GET /api/subscribe/[email] - Get subscriber by email (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  return withAdminAuth(async () => {
    try {
      const { email } = await params;
      const decodedEmail = decodeURIComponent(email);
      
      if (!decodedEmail) {
        return createErrorResponse("Email is required", 400);
      }
      
      const subscriber = await findSubscriberByEmail(decodedEmail);
      
      if (!subscriber) {
        return createErrorResponse("Subscriber not found", 404);
      }
      
      return createSuccessResponse(subscriber);
    } catch (error) {
      console.error("Error fetching subscriber:", error);
      return createErrorResponse("Server error", 500);
    }
  })(request, { params });
}

// DELETE /api/subscribe/[email] - Delete subscriber by email (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  return withAdminAuth(async () => {
    try {
      const { email } = await params;
      const decodedEmail = decodeURIComponent(email);
      
      if (!decodedEmail) {
        return createErrorResponse("Email is required", 400);
      }
      
      const success = await deleteSubscriber(decodedEmail);
      
      if (!success) {
        return createErrorResponse("Failed to delete subscriber", 500);
      }
      
      return createSuccessResponse({ 
        message: "Subscriber deleted successfully", 
        email: decodedEmail
      });
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      return createErrorResponse("Server error", 500);
    }
  })(request, { params });
} 