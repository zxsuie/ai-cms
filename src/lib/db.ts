import {createClient, SupabaseClient} from '@supabase/supabase-js';
import type {StudentVisit, Medicine, Appointment, RefillRequest} from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

type StudentVisitInsert = Omit<StudentVisit, 'id' | 'timestamp' | 'releaseFormLink'>;
type AppointmentInsert = Omit<Appointment, 'id' | 'dateTime'> & {dateTime: string};
type MedicineInsert = Omit<Medicine, 'id'>;

// Helper function to convert a single object's keys from snake_case to camelCase
const toCamelCase = (obj: any) => {
  if (!obj) return null;
  const newObj: {[key: string]: any} = {};
  for (const key in obj) {
    const newKey = key.replace(/(_\w)/g, m => m[1].toUpperCase());
    newObj[newKey] = obj[key];
  }
  return newObj;
};

// Helper function to convert an array of objects' keys from snake_case to camelCase
const toCamelCaseArray = (arr: any[]) => {
  if (!arr) return [];
  return arr.map(obj => toCamelCase(obj));
};

// Helper function to convert a single object's keys from camelCase to snake_case
const toSnakeCase = (obj: any) => {
  if (!obj) return null;
  const newObj: {[key: string]: any} = {};
  for (const key in obj) {
    const newKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    newObj[newKey] = obj[key];
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
    return toCamelCaseArray(data) as StudentVisit[];
  },
  
  addVisit: async (visitData: StudentVisitInsert): Promise<StudentVisit> => {
    const {data, error} = await supabase.from('visits').insert(toSnakeCase(visitData)).select().single();
    if (error) throw error;
    return toCamelCase(data) as StudentVisit;
  },

  addReleaseFormLink: async (visitId: string, link: string): Promise<boolean> => {
    const {error} = await supabase
      .from('visits')
      .update({release_form_link: link})
      .eq('id', visitId);
    return !error;
  },
  
  // Medicines
  getMedicines: async (): Promise<Medicine[]> => {
    const {data, error} = await supabase.from('medicines').select('*').order('name');
    if (error) throw error;
    return toCamelCaseArray(data) as Medicine[];
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

  dispenseMedicine: async (medicineId: string): Promise<boolean> => {
    const {data, error} = await supabase.rpc('dispense_medicine', {med_id: medicineId});
    if (error) throw error;
    return data;
  },

  // Refills
  requestRefill: async (medicineId: string): Promise<boolean> => {
    const {data: medicine, error: findError} = await supabase.from('medicines').select('name').eq('id', medicineId).single();
    if (findError || !medicine) throw findError || new Error('Medicine not found');
    
    const newRequest = {medicine_id: medicineId, medicine_name: medicine.name};
    const {error} = await supabase.from('refill_requests').insert(newRequest);
    return !error;
  },

  // Appointments
  getAppointments: async (): Promise<Appointment[]> => {
    const {data, error} = await supabase
      .from('appointments')
      .select('*')
      .order('date_time', {ascending: true});
    if (error) throw error;
    return toCamelCaseArray(data) as Appointment[];
  },

  addAppointment: async (apptData: AppointmentInsert): Promise<Appointment> => {
    const {data, error} = await supabase.from('appointments').insert(toSnakeCase(apptData)).select().single();
    if (error) throw error;
    return toCamelCase(data) as Appointment;
  }
};
