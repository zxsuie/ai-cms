import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('is-authenticated')?.value === 'true';
  const { pathname } = request.nextUrl;

  // If the user is authenticated, and they land on the login or agreement page, redirect them to the dashboard.
  if (isAuthenticated && (pathname === '/login' || pathname === '/agreement')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the user is not authenticated and they are trying to access a protected route, redirect them to the login page.
  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If the user is at the root, redirect them to the agreement page.
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/agreement', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // This matcher ensures the middleware runs only on specific paths.
  matcher: [
    '/',
    '/login',
    '/agreement',
    '/dashboard/:path*',
  ],
};
