import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware redirects users from the root path to the agreement page.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If the user is at the root, redirect them to the agreement page.
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/agreement', request.url));
  }
  
  // For all other paths, continue as normal.
  return NextResponse.next();
}

export const config = {
  // This matcher ensures the middleware runs only on the root path.
  matcher: [
    '/',
  ],
};
