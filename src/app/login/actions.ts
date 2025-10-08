
'use server';

import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { db } from '@/lib/db';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
});

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return 'Invalid email or password format.';
    }

    const { email, password } = parsed.data;
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return authError?.message || 'Invalid login credentials. Please try again.';
    }

    const { user: authUser } = authData;
    
    // Fetch profile to get the role
    const profile = await db.getProfile(authUser.id);
    if (!profile) {
        // This case can happen if the trigger failed.
        // We will log them out and ask them to contact support.
        await supabase.auth.signOut();
        return 'User profile not found. Please contact support.';
    }

    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    session.isLoggedIn = true;
    session.user = {
      id: authUser.id,
      email: authUser.email!,
      role: profile.role,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
    };
    await session.save();
    
  } catch (error: any) {
    if (error.message.includes('Invalid login credentials')) {
        return 'Invalid email or password.';
    }
    console.error('Authentication error:', error);
    return 'An unexpected error occurred. Please try again.';
  }

  redirect('/dashboard');
}


export async function signInWithGoogle() {
    const redirectTo = 'https://6000-firebase-studio-1758098726328.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev/api/auth/callback';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectTo,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });

    if (error) {
        console.error('Google Sign In Error:', error);
        redirect(`/login?error=oauth_error&message=${encodeURIComponent(error.message)}`);
    } else if (data.url) {
        redirect(data.url);
    } else {
        redirect('/login?error=unknown_oauth_error');
    }
}
