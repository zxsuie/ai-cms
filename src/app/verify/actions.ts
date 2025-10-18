
'use server';

import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '@/lib/session';
import { db } from '@/lib/db';
import { differenceInHours } from 'date-fns';

const verifySchema = z.object({
  email: z.string().email(),
  pin: z.string().min(6),
});

const MAX_ATTEMPTS = 5;
const LOCKOUT_HOURS = 1;

export async function verifyOtp(prevState: any, formData: FormData) {
  const parsed = verifySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { error: "Invalid input. Please provide a 6-digit code." };
  }

  const { email, pin } = parsed.data;
  
  const profile = await db.getProfileByEmail(email);

  if (!profile) {
    return { error: 'User profile not found. Please try logging in again.' };
  }

  if (profile.failedLoginAttempts && profile.failedLoginAttempts >= MAX_ATTEMPTS) {
    if (profile.lastFailedLoginAt && differenceInHours(new Date(), new Date(profile.lastFailedLoginAt)) < LOCKOUT_HOURS) {
      return { error: `Too many failed attempts. Your account is locked for ${LOCKOUT_HOURS} hour.` };
    } else {
      await db.updateProfile(profile.id, { failedLoginAttempts: 0, lastFailedLoginAt: null });
    }
  }

  // Verify the OTP. The type 'email' is used for OTPs sent via `signInWithOtp`.
  const { data: { session: supabaseSession }, error } = await supabase.auth.verifyOtp({
    email,
    token: pin,
    type: 'email', 
  });

  if (error) {
    const newAttemptCount = (profile.failedLoginAttempts || 0) + 1;
    await db.updateProfile(profile.id, {
        failedLoginAttempts: newAttemptCount,
        lastFailedLoginAt: new Date().toISOString(),
    });

    if (newAttemptCount >= MAX_ATTEMPTS) {
        return { error: `Too many failed attempts. Your account is locked for ${LOCKOUT_HOURS} hour.` };
    }
    
    console.error('OTP Verification Error:', error);
    if (error.message.includes('Token has expired') || error.message.includes('not found') || error.message.includes('is invalid')) {
      return { error: 'Invalid or expired verification code. Please request a new one.' };
    }
    return { error: error.message };
  }

  if (!supabaseSession) {
    return { error: 'Could not verify your identity. Please try again.' };
  }
  
  await db.updateProfile(profile.id, { failedLoginAttempts: 0, lastFailedLoginAt: null });

  const { user: authUser } = supabaseSession;
  const fullProfile = await db.getProfile(authUser.id);
  if (!fullProfile) {
    await supabase.auth.signOut();
    return { error: 'User profile not found after verification. Please contact support.' };
  }

  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  session.isLoggedIn = true;
  session.user = fullProfile;
  await session.save();

  const isAdmin = fullProfile.role === 'admin' || fullProfile.role === 'super_admin';
  redirect(isAdmin ? '/dashboard' : '/appointments');
}


export async function resendOtp(email: string) {
    if (!email) {
        return { error: 'Email address is missing.', success: false };
    }
    
    // This action re-sends the OTP using the same mechanism as the login page.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
        console.error('Resend OTP error:', error);
        return { error: "Failed to resend code. Please wait a moment and try again.", success: false };
    }

    return { success: true };
}
