
'use client';

import { useState, useEffect } from 'react';
import type { SessionData } from '@/lib/session';
import { usePathname, useRouter } from 'next/navigation';

export function useUser() {
    const [session, setSession] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        async function fetchSession() {
            try {
                const res = await fetch('/api/auth/session');
                if (res.ok) {
                    const data = await res.json();
                    setSession(data);
                } else {
                    setSession(null);
                }
            } catch (error) {
                console.error('Failed to fetch session:', error);
                setSession(null);
            } finally {
                setLoading(false);
            }
        }
        fetchSession();
    }, [pathname, router]); // Re-fetch on path change

    return { user: session?.user, isLoggedIn: session?.isLoggedIn, loading };
}
