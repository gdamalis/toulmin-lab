import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { parseRequestBody } from "@/lib/api/middleware";
import { withAuth } from "@/lib/api/auth";
import { sendUserInvitation } from "@/lib/services/email";
import { getLocale } from "next-intl/server";

interface SendEmailRequestBody {
  type: 'user_invitation';
  to: string;
  inviterName: string;
  userRole: string;
  temporaryPassword?: string | null;
}

// POST /api/email/send - Send emails (authenticated users only)
export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAuth(async () => {
    try {
      const body = await parseRequestBody<SendEmailRequestBody>(request);
      
      if (!body.type || !body.to) {
        return createErrorResponse("Missing required fields: type and to", 400);
      }

      // Validate email type
      if (body.type !== 'user_invitation') {
        return createErrorResponse("Invalid email type", 400);
      }

      // Validate required fields for user invitation
      if (!body.inviterName || !body.userRole) {
        return createErrorResponse("Missing required fields for user invitation", 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.to)) {
        return createErrorResponse("Invalid email address", 400);
      }

      const locale = await getLocale();

      let result;

      switch (body.type) {
        case 'user_invitation':
          result = await sendUserInvitation(
            body.to,
            body.inviterName,
            body.userRole,
            body.temporaryPassword ?? null,
            locale
          );
          break;
        default:
          return createErrorResponse("Unsupported email type", 400);
      }

      if (!result.success) {
        console.error('Email sending failed:', result.error);
        return createErrorResponse(
          result.error ?? "Failed to send email",
          500
        );
      }

      return createSuccessResponse({
        message: "Email sent successfully",
        emailId: result.data?.id,
      });
    } catch (error) {
      console.error("Error in POST /api/email/send:", error);
      return createErrorResponse("Invalid request", 400);
    }
  })(request, context);
} 