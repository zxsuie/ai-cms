
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

    if (profile && profile.failedLoginAttempts && profile.failedLoginAttempts >= MAX_ATTEMPTS) {
      if (profile.lastFailedLoginAt && differenceInHours(new Date(), new Date(profile.lastFailedLoginAt)) < LOCKOUT_HOURS) {
        return `Too many failed attempts. Your account is locked for ${LOCKOUT_HOURS} hour.`;
      } else {
        await db.updateProfile(profile.id, { failedLoginAttempts: 0, lastFailedLoginAt: null });
      }
    }

    // Step 1: Verify the password. This does NOT log the user in but confirms the credential is valid.
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (passwordError) {
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
      return passwordError.message || 'Invalid login credentials. Please try again.';
    }

    // Step 2: If password is correct, trigger the OTP email send.
    // This starts the passwordless flow that the verification page will complete.
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't create a new user if they don't exist
      }
    });

    if (otpError) {
      console.error('OTP trigger error:', otpError);
      return 'Could not send verification code. Please try again.';
    }

    // Reset failed attempts on successful password verification
    if (profile) {
      await db.updateProfile(profile.id, { failedLoginAttempts: 0, lastFailedLoginAt: null });
    }

  } catch (error: any) {
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
