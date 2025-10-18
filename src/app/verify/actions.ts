
'use server';

import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '@/lib/session';
import { db } from '@/lib/db';

const verifySchema = z.object({
  email: z.string().email(),
  pin: z.string().min(6),
});

export async function verifyOtp(prevState: any, formData: FormData) {
  const parsed = verifySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { error: "Invalid input. Please provide a 6-digit code." };
  }

  const { email, pin } = parsed.data;

  const { data: { session: supabaseSession }, error } = await supabase.auth.verifyOtp({
    email,
    token: pin,
    type: 'token',
  });

  if (error) {
    console.error('OTP Verification Error:', error);
    if (error.message.includes('Token has expired') || error.message.includes('not found') || error.message.includes('is invalid')) {
      return { error: 'Invalid or expired verification code. Please request a new one.' };
    }
    return { error: error.message };
  }

  if (!supabaseSession) {
    return { error: 'Could not verify your identity. Please try again.' };
  }

  // OTP is valid, now create the application session
  const { user: authUser } = supabaseSession;
  const profile = await db.getProfile(authUser.id);
  if (!profile) {
    await supabase.auth.signOut();
    return { error: 'User profile not found. Please contact support.' };
  }

  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  session.isLoggedIn = true;
  session.user = profile;
  await session.save();

  const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';
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

    