
import {NextResponse} from 'next/server';
import {getIronSession} from 'iron-session';
import {sessionOptions, type SessionData, defaultSession} from '@/lib/session';
import {cookies} from 'next/headers';

export async function GET(request: Request) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (session.isLoggedIn !== true) {
    return NextResponse.json(defaultSession);
  }

  return NextResponse.json(session);
}
