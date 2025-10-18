
'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { differenceInHours } from 'date-fns';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const MAX_ATTEMPTS = 5;
const LOCKOUT_HOURS = 1;

export async function loginWithPasswordAndOtp(
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

    // Check if user is locked out
    if (profile && profile.failedLoginAttempts && profile.failedLoginAttempts >= MAX_ATTEMPTS) {
      if (profile.lastFailedLoginAt && differenceInHours(new Date(), new Date(profile.lastFailedLoginAt)) < LOCKOUT_HOURS) {
        return `Too many failed attempts. Please try again in ${LOCKOUT_HOURS} hour.`;
      } else {
        // If lockout period has passed, reset attempts
        await db.updateProfile(profile.id, { failedLoginAttempts: 0, lastFailedLoginAt: null });
      }
    }

    // First, sign in with password to verify credentials.
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      // Handle failed login attempt
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
      return authError?.message || 'Invalid login credentials. Please try again.';
    }

    // On successful password validation, send the OTP.
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      console.error('OTP Sending Error:', otpError);
      return 'Could not send verification code. Please try again.';
    }
    
    // Reset failed attempts on successful password verification
    if (profile) {
      await db.updateProfile(profile.id, { failedLoginAttempts: 0, lastFailedLoginAt: null });
    }

  } catch (error: any) {
    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password.';
    }
    console.error('Authentication error:', error);
    return 'An unexpected error occurred. Please try again.';
  }
  
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
