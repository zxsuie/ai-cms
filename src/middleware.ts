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

  // If user is not logged in and is trying to access a protected page, redirect to login
  if (!session.isLoggedIn && !pathname.startsWith('/login') && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and tries to access the login page, redirect to dashboard
  if (session.isLoggedIn && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // if the user is logged in and is accessing the root, redirect to dashboard
  if (session.isLoggedIn && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // if the user is not logged in and accessing root, redirect to login
  if (!session.isLoggedIn && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
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
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth/login).*)',
  ],
};
