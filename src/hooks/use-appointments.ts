
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
      let data;
      if (filter === 'user' && userName) {
        data = await db.getAppointments({ filter: 'user', userName });
      } else { // filter 'all' or if userName is not yet available
        data = await db.getAppointments({ filter: 'all' });
      }
      setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filter, userName]);

  useEffect(() => {
    const canFetch = filter === 'all' || (filter === 'user' && !!userName);

    if (canFetch) {
      fetchAppointments();
    } else {
      // Don't fetch yet if we are waiting for a username
      if (filter === 'user' && !userName) {
          setLoading(true); // Keep loading state until username is available
      } else {
           setLoading(false);
      }
      setAppointments([]);
      return;
    }


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
