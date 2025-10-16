
'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

export function useInactivityLogout(timeout: number | null) {
  const router = useRouter();
  const { toast } = useToast();

  const logout = useCallback(async () => {
    // Clear session on the server
    await fetch('/api/auth/logout', { method: 'POST' });
    
    // Show toast message
    toast({
      title: 'Session Expired',
      description: 'You have been logged out due to inactivity.',
    });

    // Redirect to login page
    router.push('/login');
    router.refresh(); // Ensure session state is cleared on the client
  }, [router, toast]);

  useEffect(() => {
    // If timeout is null, the user is not logged in, so do nothing.
    if (timeout === null) {
      return;
    }

    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(logout, timeout);
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Set up event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize the timer
    resetTimer();

    // Cleanup function
    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [timeout, logout]);
}
