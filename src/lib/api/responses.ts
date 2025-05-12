import { NextResponse } from "next/server";

/**
 * Generic API response type
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Creates a success response with optional data
 */
export function createSuccessResponse<T>(data?: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json<ApiResponse<T>>({
    success: true,
    data,
  });
}

/**
 * Creates an error response with message and status code
 */
export function createErrorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse<never>> {
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error },
    { status }
  );
} 