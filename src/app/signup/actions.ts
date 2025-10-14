
'use server';

import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { signupSchema } from '@/lib/types';

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

    // The redirect URL for the email verification link
    const emailRedirectTo = `https://6000-firebase-studio-1758098726328.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev/api/auth/callback`;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                ...profileData, // Pass all profile data including role, course, etc.
            },
            emailRedirectTo,
        },
    });

    if (error) {
        console.error('Signup error:', error);
        return { message: error.message, success: false };
    }

    // On successful signup, Supabase sends a confirmation email.
    return { 
        message: 'Confirmation link sent to your email. Please verify to log in.', 
        success: true 
    };
}
