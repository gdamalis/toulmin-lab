import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@/types/roles";

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Skip API routes and static assets
  if (
    path.startsWith('/api/') || 
    path.startsWith('/_next/') || 
    path.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }
  
  // Get the token with proper configuration for both development and production
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token',
    secureCookie: process.env.NODE_ENV === "production",
  });

  // Store the original URL for callback
  const callbackUrl = encodeURI(request.url);
  
  // PUBLIC ROUTES
  // If user is authenticated on public routes, redirect to dashboard
  if (path.startsWith("/auth")) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ADMIN ROUTES
  // Admin routes require administrator role
  if (path.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/auth", request.url);
      url.searchParams.set("callbackUrl", callbackUrl);
      return NextResponse.redirect(url);
    }
    
    // Check for admin role
    if (token.role !== Role.ADMINISTRATOR) {
      // Redirect admins to user dashboard if they try to access admin routes
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return NextResponse.next();
  }

  // USER ROUTES
  // User routes require authentication (any role)
  if (path.startsWith("/dashboard") || path.startsWith("/argument") || path.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/auth", request.url);
      url.searchParams.set("callbackUrl", callbackUrl);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 