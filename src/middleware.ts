import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Use a more robust token retrieval approach
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
    cookieName: process.env.NEXTAUTH_URL ? "next-auth.session-token" : "__Secure-next-auth.session-token"
  });

  console.log("Token:", token, process.env.NEXTAUTH_SECRET, process.env.NODE_ENV, process.env.NEXTAUTH_URL);

  // Check if the path starts with /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // If there's no token or the user is not an admin, redirect to auth page
    if (!token || token.role !== "administrator") {
      const url = new URL("/auth", request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
}; 