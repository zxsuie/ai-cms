
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
    // Should not happen in this flow, but handle defensively
    return { error: 'User profile not found. Please try logging in again.' };
  }

  // Check if user is locked out
  if (profile && profile.failedLoginAttempts && profile.failedLoginAttempts >= MAX_ATTEMPTS) {
    if (profile.lastFailedLoginAt && differenceInHours(new Date(), new Date(profile.lastFailedLoginAt)) < LOCKOUT_HOURS) {
      return { error: `Too many failed attempts. Please try again in ${LOCKOUT_HOURS} hour.` };
    } else {
      await db.updateProfile(profile.id, { failedLoginAttempts: 0, lastFailedLoginAt: null });
    }
  }

  const { data: { session: supabaseSession }, error } = await supabase.auth.verifyOtp({
    email,
    token: pin,
    type: 'token',
  });

  if (error) {
     // Handle failed verification attempt
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
  
  // Reset failed attempts on successful verification
  await db.updateProfile(profile.id, { failedLoginAttempts: 0, lastFailedLoginAt: null });


  // OTP is valid, now create the application session
  const { user: authUser } = supabaseSession;
  const fullProfile = await db.getProfile(authUser.id); // Re-fetch full profile after verification
  if (!fullProfile) {
    await supabase.auth.signOut();
    return { error: 'User profile not found. Please contact support.' };
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
    
    // Use signInWithOtp which will send a new 6-digit code.
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: false,
        }
    });

    if (error) {
        console.error('Resend OTP error:', error);
        return { error: "Failed to resend code. Please wait a moment and try again.", success: false };
    }

    return { success: true };
}
