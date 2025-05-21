import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { getUserAnalytics } from "@/lib/mongodb/users";
import { getToulminArgumentAnalytics } from "@/lib/mongodb/toulmin-arguments";
import { withAdminAuth } from "@/lib/api/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return withAdminAuth(async () => {
    try {
      const userAnalytics = await getUserAnalytics();
      const argumentAnalytics = await getToulminArgumentAnalytics();
      
      return createSuccessResponse({
        ...userAnalytics,
        ...argumentAnalytics,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      return createErrorResponse("Failed to fetch analytics data", 500);
    }
  })(request, context);
} 