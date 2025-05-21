import { parseRequestBody } from "@/lib/api/middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { addSubscriber, findAllSubscribers } from "@/lib/mongodb/subscribers";
import { NextRequest } from "next/server";
import { z } from "zod";
import { withAdminAuth } from "@/lib/api/auth";

// Input validation schema
const subscribeSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// GET /api/subscribe - Get all subscribers (admin only)
export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAdminAuth(async () => {
    try {
      // Get all subscribers from the service
      const subscribers = await findAllSubscribers();
      
      return createSuccessResponse(subscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      return createErrorResponse("Internal Server Error", 500);
    }
  })(request, context);
}

// POST /api/subscribe - Add a new subscriber
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await parseRequestBody(request);
    const validationResult = subscribeSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors[0]?.message ?? "Invalid email format",
        400
      );
    }
    
    const { email } = validationResult.data;
    
    // Add the subscriber to the database
    const result = await addSubscriber(email);
    
    if (!result) {
      return createErrorResponse("Failed to add subscriber", 500);
    }
    
    return createSuccessResponse({ 
      message: "Successfully subscribed",
      email
    });
  } catch (error) {
    console.error("Error in POST /api/subscribe:", error);
    return createErrorResponse("Server error", 500);
  }
} 