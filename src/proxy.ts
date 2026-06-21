import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;

  // Paths requiring authentication
  const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/master');
  // Paths requiring Admin role
  const isAdminPath = path.startsWith('/master');

  if (!session) {
    if (isProtectedPath) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Default root page "/" redirects to "/login" if not authenticated
    if (path === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    try {
      const user = JSON.parse(session);
      
      // If user is logged in and visits login page or root, redirect to dashboard
      if (path === '/login' || path === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // If user is not admin and tries to access admin path, redirect to dashboard
      if (isAdminPath && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      // In case session cookie is corrupted, delete cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/master/:path*']
};
