
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

export async function loginWithPasswordAndOtp(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return 'Invalid email or password format.';
    }

    const { email, password } = parsed.data;

    // First, sign in with password to verify credentials.
    // This creates a temporary session.
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return authError?.message || 'Invalid login credentials. Please try again.';
    }

    // DO NOT sign out here. The session is needed for the OTP to be linked.

    // Now, send the OTP to the user's email. This will be associated
    // with the session we just created.
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't create a new user if they don't exist
      },
    });

    if (otpError) {
      console.error('OTP Sending Error:', otpError);
      // Even if OTP fails, sign the user out to prevent a dangling session.
      await supabase.auth.signOut();
      return 'Could not send verification code. Please try again.';
    }
    
  } catch (error: any) {
    if (error.message.includes('Invalid login credentials')) {
        return 'Invalid email or password.';
    }
    console.error('Authentication error:', error);
    return 'An unexpected error occurred. Please try again.';
  }

  const email = formData.get('email') as string;
  // Redirect to the verification page, passing the email as a query parameter.
  redirect(`/verify?email=${encodeURIComponent(email)}`);
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
