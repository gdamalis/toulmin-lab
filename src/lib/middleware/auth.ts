import { getToken } from "@/lib/firebase/auth-admin";
import { Role, isAdmin } from "@/types/roles";
import { NextResponse } from "next/server";

export type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    role: Role;
  };
};

export async function verifyAuth(
  request: Request
): Promise<{ userId: string; role: Role } | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1];
  const decodedToken = await getToken(token);

  if (!decodedToken?.uid || !decodedToken.role) {
    return null;
  }

  return {
    userId: decodedToken.uid,
    role: decodedToken.role as Role,
  };
}

export async function requireAdmin(
  request: Request
): Promise<{ success: boolean; response?: NextResponse; userId?: string }> {
  const auth = await verifyAuth(request);
  if (!auth) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  if (!isAdmin(auth.role)) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Forbidden: Requires administrator privileges",
        },
        { status: 403 }
      ),
    };
  }

  return { success: true, userId: auth.userId };
}
