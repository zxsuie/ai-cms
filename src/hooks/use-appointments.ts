
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
      } else if (filter === 'all') {
        data = await db.getAppointments({ filter: 'all' });
      } else {
        data = [];
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
    // Determine if we are ready to fetch
    const canFetch = filter === 'all' || (filter === 'user' && !!userName);

    if (canFetch) {
      fetchAppointments();
    } else {
      setLoading(false);
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
