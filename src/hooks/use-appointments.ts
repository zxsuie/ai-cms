
'use client'

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import type { Appointment } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      const data = await db.getAppointments();
      setAppointments(data);
      setLoading(false);
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
  }, []);

  return { appointments, loading };
}
