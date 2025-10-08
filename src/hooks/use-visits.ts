
'use client'

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { StudentVisit } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export function useVisits() {
  const [visits, setVisits] = useState<StudentVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.getVisits();
      setVisits(data);
    } catch (error) {
      console.error("Failed to fetch visits:", error);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();

    const channel = supabase
      .channel('visits-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'visits' },
        (payload) => {
          fetchVisits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVisits]);

  return { visits, loading };
}
