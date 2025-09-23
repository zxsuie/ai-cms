'use client';

import { supabase } from '@/lib/supabase';
import type { StudentVisit, Medicine, RefillRequest, Appointment } from '@/lib/types';

// Data access layer using Supabase
export const db = {
  getVisits: async (): Promise<StudentVisit[]> => {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching visits:', error);
      return [];
    }
    
    // Map snake_case from db to camelCase for the app
    return data.map(v => ({
      id: v.id,
      timestamp: v.timestamp,
      studentName: v.student_name,
      studentId: v.student_id,
      symptoms: v.symptoms,
      reason: v.reason,
      aiSuggestion: v.ai_suggestion,
      releaseFormLink: v.release_form_link,
    }));
  },
  
  addVisit: async (visitData: Omit<StudentVisit, 'id' | 'timestamp' | 'aiSuggestion' | 'releaseFormLink'>, aiSuggestion: string): Promise<StudentVisit> => {
    const newVisit = {
      id: `v${Date.now()}`,
      student_name: visitData.studentName,
      student_id: visitData.studentId,
      symptoms: visitData.symptoms,
      reason: visitData.reason,
      ai_suggestion: aiSuggestion,
    };

    const { data, error } = await supabase.from('visits').insert(newVisit).select().single();

    if (error) {
      console.error('Error adding visit:', error);
      throw error;
    }

    return {
      id: data.id,
      timestamp: data.timestamp,
      studentName: data.student_name,
      studentId: data.student_id,
      symptoms: data.symptoms,
      reason: data.reason,
      aiSuggestion: data.ai_suggestion,
      releaseFormLink: data.release_form_link,
    };
  },

  addReleaseFormLink: async (visitId: string, link: string): Promise<boolean> => {
    const { error } = await supabase
      .from('visits')
      .update({ release_form_link: link })
      .eq('id', visitId);

    if (error) {
      console.error('Error adding release form link:', error);
      return false;
    }
    return true;
  },
  
  getMedicines: async (): Promise<Medicine[]> => {
    const { data, error } = await supabase.from('medicines').select('*').order('name');
    if (error) {
      console.error('Error fetching medicines:', error);
      return [];
    }
    return data;
  },

  dispenseMedicine: async (medicineId: string): Promise<boolean> => {
    // This action requires a special function in your Supabase database.
    // Go to the SQL Editor in your Supabase dashboard and run the query
    // provided in the documentation to create the `dispense_medicine` function.
    const { data, error } = await supabase.rpc('dispense_medicine', { med_id: medicineId });

    if (error) {
      console.error('Error dispensing medicine:', error);
      return false;
    }
    return data;
  },

  requestRefill: async (medicineId: string): Promise<boolean> => {
    const medicine = await supabase.from('medicines').select('name').eq('id', medicineId).single();
    
    if (medicine.error || !medicine.data) {
        console.error('Error finding medicine for refill request:', medicine.error);
        return false;
    }

    const newRequest = {
        id: `r${Date.now()}`,
        medicine_id: medicineId,
        medicine_name: medicine.data.name,
    };

    const { error } = await supabase.from('refill_requests').insert(newRequest);

    if (error) {
      console.error('Error requesting refill:', error);
      return false;
    }
    return true;
  },

  getAppointments: async (): Promise<Appointment[]> => {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date_time', { ascending: true });

    if (error) {
        console.error('Error fetching appointments:', error);
        return [];
    }
    
    return data.map(a => ({
        id: a.id,
        studentName: a.student_name,
        studentId: a.student_id,
        reason: a.reason,
        dateTime: a.date_time,
    }));
  },

  addAppointment: async (apptData: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const newAppt = {
        id: `a${Date.now()}`,
        student_name: apptData.studentName,
        student_id: apptData.studentId,
        reason: apptData.reason,
        date_time: apptData.dateTime,
    };

    const { data, error } = await supabase.from('appointments').insert(newAppt).select().single();
    
    if (error) {
        console.error('Error adding appointment:', error);
        throw error;
    }

    return {
        id: data.id,
        studentName: data.student_name,
        studentId: data.student_id,
        reason: data.reason,
        dateTime: data.date_time,
    };
  }
};
