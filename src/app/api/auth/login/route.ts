import {NextResponse} from 'next/server';
import {getIronSession} from 'iron-session';
import {sessionOptions, type SessionData} from '@/lib/session';
import {cookies} from 'next/headers';

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  const body = await request.json();

  // For now, always log in successfully regardless of credentials.
  session.isLoggedIn = true;
  session.username = body.username || 'admin'; // Use provided username or default to 'admin'
  await session.save();

  return NextResponse.json({ok: true, message: 'Login successful'});
}
