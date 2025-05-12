/**
 * Extracts token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  
  return authHeader.split("Bearer ")[1];
} 