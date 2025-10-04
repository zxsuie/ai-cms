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

  // If user is logged in
  if (session.isLoggedIn) {
    // and tries to access a public page (like login) or the root, redirect to dashboard
    if (isPublicPage || pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } 
  // If user is not logged in
  else {
    // and is trying to access a protected page, redirect to login
    if (!isPublicPage && !isApiRoute && pathname !== '/') {
       return NextResponse.redirect(new URL('/login', request.url));
    }
    // and is on the root, redirect to login
    if (pathname === '/') {
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
