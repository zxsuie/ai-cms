
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard';
  
  // The an application's public URL is required to create a new Supabase client.
  const appUrl = 'https://6000-firebase-studio-1758098726328.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev';

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );
    const { error, data: { session: supabaseSession } } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && supabaseSession) {
      const { user: authUser } = supabaseSession;
      
      const profile = await db.getProfile(authUser.id);
      if (!profile) {
        // This case can happen if the trigger failed.
        await supabase.auth.signOut();
        return NextResponse.redirect(`${appUrl}/login?error=profile_not_found`);
      }

      const session = await getIronSession<SessionData>(cookies(), sessionOptions);
      session.isLoggedIn = true;
      session.user = {
        id: authUser.id,
        email: authUser.email!,
        role: profile.role,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        // Add all profile fields to the session
        course: profile.course,
        studentSection: profile.studentSection,
        department: profile.department,
        jobTitle: profile.jobTitle,
      };
      await session.save();

      return NextResponse.redirect(`${appUrl}${next}`);
    } else {
        console.error("OAuth callback error:", error);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${appUrl}/login?error=auth_failed`);
}
