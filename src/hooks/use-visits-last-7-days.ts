
'use client'

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { StudentVisit } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { subDays, format, parseISO } from 'date-fns';

interface DailyVisitData {
    [day: string]: number;
}
interface SymptomCountData {
    [symptom: string]: number;
}


export function useVisitsLast7Days() {
  const [data, setData] = useState<DailyVisitData>({});
  const [symptomCounts, setSymptomCounts] = useState<SymptomCountData>({});
  const [loading, setLoading] = useState(true);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const visits = await db.getVisitsLast7Days();
      
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        return format(subDays(new Date(), i), 'EEEE');
      }).reverse();

      const dailyCounts: DailyVisitData = last7Days.reduce((acc, day) => {
        acc[day] = 0;
        return acc;
      }, {} as DailyVisitData);

      const symptoms: SymptomCountData = {};

      visits.forEach(visit => {
        const visitDay = format(parseISO(visit.timestamp), 'EEEE');
        if (dailyCounts[visitDay] !== undefined) {
          dailyCounts[visitDay]++;
        }
        
        // Standardize symptoms to be case-insensitive and handle multiple entries
        const visitSymptoms = visit.symptoms.split(/, | /).map(s => s.trim().toLowerCase());
        visitSymptoms.forEach(symptom => {
          if (symptom) {
             // Capitalize first letter for consistent display
             const capitalizedSymptom = symptom.charAt(0).toUpperCase() + symptom.slice(1);
             symptoms[capitalizedSymptom] = (symptoms[capitalizedSymptom] || 0) + 1;
          }
        });

      });

      setData(dailyCounts);
      setSymptomCounts(symptoms);
    } catch (error) {
      console.error("Failed to fetch visits:", error);
      setData({});
      setSymptomCounts({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();

    const channel = supabase
      .channel('visits-7days-changes')
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

  return { data, symptomCounts, loading };
}
