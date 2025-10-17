
'use server';

import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { signupSchema } from '@/lib/types';
import { redirect } from 'next/navigation';

type SignupState = {
    message: string | null;
    success: boolean;
};

export async function signup(prevState: SignupState, formData: FormData): Promise<SignupState> {
    const parsed = signupSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!parsed.success) {
        const errorMessages = parsed.error.errors.map(e => e.message).join(' ');
        return { message: errorMessages, success: false };
    }

    const { email, password, confirmPassword, ...profileData } = parsed.data;

    // The redirect URL is not needed here as we will redirect manually.
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                ...profileData, 
            },
        },
    });

    if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('User already registered')) {
            return { message: 'An account with this email address already exists. Please log in instead.', success: false };
        }
        return { message: error.message, success: false };
    }

    if (!data.user) {
        return { message: 'Could not create user. Please try again.', success: false };
    }

    // On successful signup, Supabase sends a confirmation email by default.
    // We will now also send an OTP for immediate verification.
    const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: false,
        }
    });

    if (otpError) {
        console.error('OTP sending error after signup:', otpError);
        // User is created but OTP failed. Ask them to log in.
        return { 
            message: "Account created, but couldn't send verification code. Please try logging in.", 
            success: true 
        };
    }
    
    // Redirect to the OTP verification page
    redirect(`/verify?email=${encodeURIComponent(email)}`);
}
