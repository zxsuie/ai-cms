
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

    // The `signUp` function will send a verification email by default.
    // Supabase handles sending the appropriate verification type (link or code)
    // based on your project's email template settings.
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
    
    // Redirect to the OTP verification page. The user will get the code from the email
    // that Supabase sent as part of the signUp process.
    redirect(`/verify?email=${encodeURIComponent(email)}`);
}
