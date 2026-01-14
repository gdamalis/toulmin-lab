import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { parseRequestBody } from "@/lib/api/middleware";
import { withAuth } from "@/lib/api/auth";
import { sendUserInvitation } from "@/lib/services/email";
import { getLocale } from "next-intl/server";
import { validateSendEmail } from "@/lib/validation/email";
import { logger } from "@/lib/logger";

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
      
      // Check email type first
      if (!body.type || body.type !== 'user_invitation') {
        return createErrorResponse("Invalid or missing email type", 400);
      }

      // Validate request body with Zod
      const validation = validateSendEmail({
        to: body.to,
        inviterName: body.inviterName,
        userRole: body.userRole,
        temporaryPassword: body.temporaryPassword,
      });

      if (!validation.success) {
        return createErrorResponse(
          `Invalid request data: ${validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          400
        );
      }

      const validatedData = validation.data;
      const locale = await getLocale();

      const result = await sendUserInvitation(
        validatedData.to as string, // Single email address for user invitations
        validatedData.inviterName,
        validatedData.userRole,
        validatedData.temporaryPassword ?? null,
        validatedData.locale ?? locale
      );

      if (!result.success) {
        logger.error('Email sending failed', new Error(result.error));
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
      logger.error("Error in POST /api/email/send", error);
      return createErrorResponse("Invalid request", 400);
    }
  })(request, context);
} 