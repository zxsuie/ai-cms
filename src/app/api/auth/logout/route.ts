import {NextResponse} from 'next/server';
import {getIronSession} from 'iron-session';
import {sessionOptions, type SessionData} from '@/lib/session';
import {cookies} from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  session.destroy();
  
  // Also sign out from Supabase
  await supabase.auth.signOut();
  
  return NextResponse.json({ok: true, message: 'Logged out'});
}
