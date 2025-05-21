import { NextRequest } from "next/server";
import { createErrorResponse } from "./responses";
import { verifyAuth, AuthResult } from "@/lib/auth/middleware";
import { Role, isAdmin } from "@/types/roles";

/**
 * Type for API route handlers with authentication
 */
export type AuthedHandler<T = unknown> = (
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> },
  auth: AuthResult
) => Promise<T>;

/**
 * Higher-order function that wraps a route handler with authentication
 * 
 * Usage:
 * ```
 * export async function GET(
 *   request: NextRequest,
 *   context: { params: Promise<{ id: string }> }
 * ) {
 *   return withAuth(async (req, ctx, auth) => {
 *     // Your authenticated logic here
 *     return createSuccessResponse({ userId: auth.userId });
 *   })(request, context);
 * }
 * ```
 */
export function withAuth<T>(handler: AuthedHandler<T>) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string | string[]>> }
  ) => {
    try {
      const auth = await verifyAuth(request);
      
      if (!auth) {
        return createErrorResponse("Authentication required", 401);
      }
      
      return await handler(request, context, auth);
    } catch (error) {
      console.error("API route error:", error);
      return createErrorResponse("Internal server error", 500);
    }
  };
}

/**
 * Higher-order function that wraps a route handler with authentication 
 * and admin role check
 * 
 * Usage:
 * ```
 * export async function GET(
 *   request: NextRequest,
 *   context: { params: Promise<{ id: string }> }
 * ) {
 *   return withAdminAuth(async (req, ctx, auth) => {
 *     // Your admin-only logic here
 *     return createSuccessResponse({ allUsers: [...] });
 *   })(request, context);
 * }
 * ```
 */
export function withAdminAuth<T>(handler: AuthedHandler<T>) {
  return withAuth(async (request, context, auth) => {
    if (!isAdmin(auth.role)) {
      return createErrorResponse("Administrator access required", 403) as T;
    }
    
    return handler(request, context, auth);
  });
}

/**
 * Higher-order function that wraps a route handler with authentication
 * and specific role check
 */
export function withRoleAuth<T>(handler: AuthedHandler<T>, requiredRole: Role) {
  return withAuth(async (request, context, auth) => {
    if (auth.role !== requiredRole) {
      return createErrorResponse("Permission denied", 403) as T;
    }
    
    return handler(request, context, auth);
  });
}

/**
 * Helper function to ensure a user can only access their own data
 * unless they are an admin
 */
export function ensureSelfOrAdmin(userId: string, auth: AuthResult) {
  if (userId !== auth.userId && !auth.isAdmin) {
    return false;
  }
  return true;
} 