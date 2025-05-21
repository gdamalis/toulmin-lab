import { NextRequest } from "next/server";

/**
 * Helper to extract and parse JSON body with error handling
 */
export async function parseRequestBody<T>(request: NextRequest): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Invalid request body");
  }
}
