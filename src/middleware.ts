import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {getIronSession} from 'iron-session';
import type {SessionData} from '@/lib/session';
import {sessionOptions} from '@/lib/session';

export async function middleware(request: NextRequest) {
  const session = await getIronSession<SessionData>(
    request.cookies,
    sessionOptions
  );

  const {pathname} = request.nextUrl;

  const isPublicPage = pathname.startsWith('/login');
  const isApiRoute = pathname.startsWith('/api');

  // If user is logged in and tries to access a public page, redirect to dashboard
  if (session.isLoggedIn && isPublicPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If user is not logged in and tries to access a protected page, redirect to login
  if (!session.isLoggedIn && !isPublicPage && !isApiRoute) {
     return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is on the root path, redirect based on login status
  if (pathname === '/') {
    if (session.isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth/login (the login api route itself to avoid redirect loops)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth/login).*)',
  ],
};
