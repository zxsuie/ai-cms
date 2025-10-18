
'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { differenceInHours } from 'date-fns';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '@/lib/session';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const MAX_ATTEMPTS = 5;
const LOCKOUT_HOURS = 1;

export async function loginWithPassword(
  prevState: string | undefined,
  formData: FormData,
) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return 'Invalid email or password format.';
  }

  const { email, password } = parsed.data;

  try {
    const profile = await db.getProfileByEmail(email);

    if (profile && profile.failedLoginAttempts && profile.failedLoginAttempts >= MAX_ATTEMPTS) {
      if (profile.lastFailedLoginAt && differenceInHours(new Date(), new Date(profile.lastFailedLoginAt)) < LOCKOUT_HOURS) {
        return `Too many failed attempts. Your account is locked for ${LOCKOUT_HOURS} hour.`;
      } else {
        await db.updateProfile(profile.id, { failedLoginAttempts: 0, lastFailedLoginAt: null });
      }
    }

    const { data: { session: supabaseSession }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
       if (profile) {
        const newAttemptCount = (profile.failedLoginAttempts || 0) + 1;
        await db.updateProfile(profile.id, {
          failedLoginAttempts: newAttemptCount,
          lastFailedLoginAt: new Date().toISOString(),
        });
        if (newAttemptCount >= MAX_ATTEMPTS) {
           return `Too many failed attempts. Your account is locked for ${LOCKOUT_HOURS} hour.`;
        }
      }
      return error.message || 'Invalid login credentials. Please try again.';
    }

     if (!supabaseSession) {
      // This case can happen if the user's email is not confirmed yet.
      // Supabase sends a confirmation link in this scenario.
      return 'Please check your email to confirm your account before logging in.';
    }


    // Reset failed attempts on successful login
    if (profile) {
      await db.updateProfile(profile.id, { failedLoginAttempts: 0, lastFailedLoginAt: null });
    }

    const { user: authUser } = supabaseSession;
      
    const fullProfile = await db.getProfile(authUser.id);
    if (!fullProfile) {
      await supabase.auth.signOut();
      return 'User profile not found after login. Please contact support.';
    }

    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    session.isLoggedIn = true;
    session.user = fullProfile;
    await session.save();

    const isAdmin = fullProfile.role === 'admin' || fullProfile.role === 'super_admin';
    redirect(isAdmin ? '/dashboard' : '/appointments');


  } catch (error: any) {
    console.error('Authentication error:', error);
    return 'An unexpected error occurred. Please try again.';
  }
}


export async function signInWithGoogle() {
    const redirectTo = `https://6000-firebase-studio-1758098726328.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev/api/auth/callback`;
    
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
