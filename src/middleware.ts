
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  const { isLoggedIn, user } = session;

  const publicPaths = ['/login', '/signup', '/agreement'];
  const isPublicPath = publicPaths.includes(pathname);
  
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const defaultPage = isAdmin ? '/dashboard' : '/appointments';
  const isDashboard = pathname.startsWith('/dashboard');

  // If a non-admin tries to access the dashboard, redirect them
  if (isLoggedIn && !isAdmin && isDashboard) {
      return NextResponse.redirect(new URL('/appointments', request.url));
  }

  // If trying to access a public path while logged in, redirect to default page
  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL(defaultPage, request.url));
  }

  // If trying to access a protected path while not logged in, redirect to login
  if (!isLoggedIn && !isPublicPath && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect root to appropriate page
  if (pathname === '/') {
    if (isLoggedIn) {
        return NextResponse.redirect(new URL(defaultPage, request.url));
    }
    return NextResponse.redirect(new URL('/agreement', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
