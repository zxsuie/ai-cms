
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  const { isLoggedIn, user } = session;

  const publicPaths = ['/login', '/signup', '/agreement', '/verify'];
  const isPublicPath = publicPaths.some(p => pathname.startsWith(p));
  
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const adminDefaultPage = '/dashboard';
  const userDefaultPage = '/appointments';

  // If a non-admin tries to access a protected admin route, redirect them.
  const adminOnlyRoutes = ['/dashboard', '/inventory', '/reports', '/logs', '/security'];
  if (isLoggedIn && !isAdmin && adminOnlyRoutes.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL(userDefaultPage, request.url));
  }

  // If trying to access a public path while logged in, redirect to default page
  if (isLoggedIn && isPublicPath) {
    const defaultPage = isAdmin ? adminDefaultPage : userDefaultPage;
    return NextResponse.redirect(new URL(defaultPage, request.url));
  }

  // If trying to access a protected path while not logged in, redirect to login
  // Allow access to root ('/') which will redirect to '/agreement' if not logged in.
  if (!isLoggedIn && !isPublicPath && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Handle the root path
  if (pathname === '/') {
    if (isLoggedIn) {
        // Redirect logged-in users to their respective default pages
        const defaultPage = isAdmin ? adminDefaultPage : userDefaultPage;
        return NextResponse.redirect(new URL(defaultPage, request.url));
    } else {
        // If not logged in, redirect from root to the agreement page
        return NextResponse.redirect(new URL('/agreement', request.url));
    }
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
