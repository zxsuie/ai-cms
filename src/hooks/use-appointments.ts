
'use client'

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { Appointment } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface UseAppointmentsOptions {
  filter?: 'all' | 'user';
  userName?: string | null;
}

export function useAppointments(options: UseAppointmentsOptions = { filter: 'all' }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { filter, userName } = options;

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.getAppointments({
        filter: filter,
        userName: userName,
      });
      setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filter, userName]);

  useEffect(() => {
    // Only fetch if we have the required data for filtering
    if (filter === 'user' && !userName) {
      setLoading(false);
      setAppointments([]); // Clear appointments if user is not available
      return;
    }

    fetchAppointments();

    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAppointments, filter, userName]);

  return { appointments, loading };
}
