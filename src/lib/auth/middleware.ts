import { FirebaseToken, verifyToken } from "./firebase";
import { extractBearerToken } from "./utils";
import { Role, isAdmin } from "@/types/roles";
import { createErrorResponse } from "@/lib/api/responses";
import { NextResponse } from "next/server";

export type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    role: Role;
  };
};

export interface AuthResult {
  userId: string;
  role: Role;
}

/**
 * Verifies authentication from request headers
 */
export async function verifyAuth(
  request: Request
): Promise<AuthResult | null> {
  const authHeader = request.headers.get("Authorization");
  const token = extractBearerToken(authHeader);
  
  if (!token) {
    return null;
  }

  const result = await verifyToken(token);
  if (!result.success || !result.token) {
    return null;
  }

  const decodedToken = result.token as FirebaseToken;
  
  if (!decodedToken.role) {
    return null;
  }

  return {
    userId: decodedToken.uid,
    role: decodedToken.role as Role,
  };
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(
  request: Request
): Promise<{ success: boolean; response?: NextResponse; userId?: string }> {
  const auth = await verifyAuth(request);
  
  if (!auth) {
    return {
      success: false,
      response: createErrorResponse("Unauthorized", 401),
    };
  }

  if (!isAdmin(auth.role)) {
    return {
      success: false,
      response: createErrorResponse("Forbidden: Requires administrator privileges", 403),
    };
  }

  return { success: true, userId: auth.userId };
} 