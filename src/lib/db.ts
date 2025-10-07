
import {createClient, SupabaseClient} from '@supabase/supabase-js';
import type {StudentVisit, Medicine, Appointment, RefillRequest, ActivityLog, MedicineInsert} from '@/lib/types';
import { subDays, formatISO } from 'date-fns';
import { logVisitSchema } from './types';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

type StudentVisitInsert = z.infer<typeof logVisitSchema>;
type AppointmentInsert = Omit<Appointment, 'id'>;

// Helper function to convert a single object's keys from snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);

  const newObj: {[key: string]: any} = {};
  for (const key in obj) {
    const newKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
    newObj[newKey] = toCamelCase(obj[key]); // Recursively convert nested objects
  }
  return newObj;
};

// Helper function to convert a single object's keys from camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);

  const newObj: {[key: string]: any} = {};
  for (const key in obj) {
    const newKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    newObj[newKey] = toSnakeCase(obj[key]); // Recursively convert nested objects
  }
  return newObj;
};


// Data access layer using Supabase
export const db = {
  // Visits
  getVisits: async (): Promise<StudentVisit[]> => {
    const {data, error} = await supabase
      .from('visits')
      .select('*')
      .order('timestamp', {ascending: false});
    if (error) throw error;
    return toCamelCase(data) as StudentVisit[];
  },
   getVisitsLast7Days: async (): Promise<StudentVisit[]> => {
    const sevenDaysAgo = formatISO(subDays(new Date(), 7));
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .gte('timestamp', sevenDaysAgo)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching recent visits:', error);
      return [];
    }
    return toCamelCase(data) as StudentVisit[];
  },
  
  addVisit: async (visitData: StudentVisitInsert): Promise<StudentVisit> => {
    const {data, error} = await supabase.from('visits').insert(toSnakeCase(visitData)).select().single();
    if (error) throw error;
    return toCamelCase(data) as StudentVisit;
  },

  updateVisitAiContent: async (visitId: string, aiSuggestion: string, excuseLetterText: string): Promise<boolean> => {
    const { error } = await supabase
      .from('visits')
      .update({ ai_suggestion: aiSuggestion, excuse_letter_text: excuseLetterText })
      .eq('id', visitId);
    if (error) {
        console.error("Error updating visit AI content:", error);
    }
    return !error;
  },

  addReleaseFormLink: async (visitId: string, link: string): Promise<boolean> => {
    const {error} = await supabase
      .from('visits')
      .update({release_form_link: link})
      .eq('id', visitId);
    return !error;
  },
  
  updateExcuseLetterText: async (visitId: string, text: string): Promise<boolean> => {
    const { error } = await supabase
      .from('visits')
      .update({ excuse_letter_text: text })
      .eq('id', visitId);
    return !error;
  },

  // Medicines
  getMedicines: async (): Promise<Medicine[]> => {
    const {data, error} = await supabase.from('medicines').select('*').order('name');
    if (error) throw error;
    return toCamelCase(data) as Medicine[];
  },
  
  getLowStockCount: async (): Promise<number> => {
    const { data, error } = await supabase
      .from('medicines')
      .select('stock, threshold');

    if (error) {
      console.error('Error fetching low stock count:', error);
      return 0;
    }
    const lowStockItems = data.filter(med => med.stock < med.threshold);
    return lowStockItems.length;
  },
  
  getMedicineById: async (medicineId: string): Promise<Medicine | null> => {
    const { data, error } = await supabase.from('medicines').select('*').eq('id', medicineId).single();
    if (error) {
      console.error('Error fetching medicine by id:', error);
      return null;
    }
    return toCamelCase(data) as Medicine;
  },

  addMedicine: async (medicineData: MedicineInsert): Promise<Medicine> => {
    const { data, error } = await supabase.from('medicines').insert(toSnakeCase(medicineData)).select().single();
    if (error) throw error;
    return toCamelCase(data) as Medicine;
  },

  updateMedicineStock: async (medicineId: string, newStock: number): Promise<boolean> => {
    const { error } = await supabase
      .from('medicines')
      .update({ stock: newStock })
      .eq('id', medicineId);
    return !error;
  },

  deleteMedicine: async (medicineId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('medicines')
      .delete()
      .eq('id', medicineId);
    return !error;
  },

  dispenseMedicine: async (medicineId: string, quantity: number): Promise<boolean> => {
     const medicine = await db.getMedicineById(medicineId);
    if (!medicine || medicine.stock < quantity) {
      return false;
    }
    const newStock = medicine.stock - quantity;
    const { error } = await supabase.from('medicines').update({ stock: newStock }).eq('id', medicineId);
    return !error;
  },

  // Refills
  requestRefill: async (medicineId: string): Promise<boolean> => {
    const medicine = await db.getMedicineById(medicineId);
    if (!medicine) throw new Error('Medicine not found');
    
    const newRequest = {medicine_id: medicineId, medicine_name: medicine.name};
    const {error} = await supabase.from('refill_requests').insert(newRequest);
    return !error;
  },

  // Appointments
  getAppointments: async (): Promise<Appointment[]> => {
    const {data, error} = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', {ascending: true})
      .order('appointment_time', {ascending: true});
    if (error) throw error;
    return toCamelCase(data) as Appointment[];
  },

  addAppointment: async (apptData: AppointmentInsert): Promise<Appointment> => {
    const {data, error} = await supabase.from('appointments').insert(toSnakeCase(apptData)).select().single();
    if (error) throw error;
    return toCamelCase(data) as Appointment;
  },

  // Activity Logs
  addActivityLog: async (
    actionType: string,
    details: Record<string, any>,
    userName = 'Nurse Jackie' // Default user for now
  ): Promise<boolean> => {
    const logEntry = {
      user_name: userName,
      action_type: actionType,
      details: details,
    };
    const { error } = await supabase.from('activity_logs').insert(logEntry);
    if (error) {
      console.error('Failed to add activity log:', error);
    }
    return !error;
  },
  
  getActivityLogs: async (filters: { query?: string; actionType?: string } = {}): Promise<ActivityLog[]> => {
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters.actionType) {
      query = query.eq('action_type', filters.actionType);
    }
    
    // Note: Full-text search on JSONB is complex. This is a basic search.
    // For production, you might want to use Supabase edge functions or more advanced queries.
    if (filters.query) {
      // Updated to search specific fields in the details JSONB
      query = query.or(
        `details->>studentName.ilike.%${filters.query}%,` +
        `details->>medicineName.ilike.%${filters.query}%,` +
        `details->>actionType.ilike.%${filters.query}%,` +
        `user_name.ilike.%${filters.query}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return toCamelCase(data) as ActivityLog[];
  }
};
