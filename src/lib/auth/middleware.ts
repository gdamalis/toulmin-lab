import { createErrorResponse } from "@/lib/api/responses";
import { Role, isAdmin } from "@/types/roles";
import { NextResponse } from "next/server";
import { verifyToken } from "./firebase";

export type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    role: Role;
  };
};

export interface AuthResult {
  userId: string;
  role: Role;
  isAdmin: boolean;
}

/**
 * Extracts bearer token from authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split("Bearer ")[1];
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

  const decodedToken = result.token;
  
  if (!decodedToken.uid || !decodedToken.role) {
    return null;
  }

  return {
    userId: decodedToken.uid,
    role: decodedToken.role,
    isAdmin: isAdmin(decodedToken.role),
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

  if (!auth.isAdmin) {
    return {
      success: false,
      response: createErrorResponse("Forbidden: Requires administrator privileges", 403),
    };
  }

  return { success: true, userId: auth.userId };
} 