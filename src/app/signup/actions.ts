
'use server';

import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const signupSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

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

    const { fullName, email, password } = parsed.data;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                // The role will be set by the database trigger
            },
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
