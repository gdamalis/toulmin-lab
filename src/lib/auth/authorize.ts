import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Role } from "@/types/roles";

/**
 * Server-side role-based access control helper.
 * Call this in a Server Component / Route Handler to ensure the current
 * session exists and the user possesses one of the allowed roles.
 * If the session is missing or the role is not permitted, the user is
 * redirected to a safe location.
 */
export async function authorize(allowedRoles: Role[] = [Role.USER]) {
  // Fetch the current session (cookies must be forwarded automatically).
  const session = await getServerSession(authOptions);

  // No active session – send to sign-in page.
  if (!session) {
    redirect("/auth");
  }

  const role = (session.user?.role ?? Role.USER) as Role;

  // Role not authorised – take user back to home.
  if (!allowedRoles.includes(role)) {
    redirect("/");
  }

  return session;
} 