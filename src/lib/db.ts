
import { createClient } from '@supabase/supabase-js';
import type { StudentVisit, Medicine, Appointment } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

type StudentVisitInsert = Omit<StudentVisit, 'id' | 'timestamp' | 'releaseFormLink'>;
type AppointmentInsert = Omit<Appointment, 'id'>;


// Helper function to map snake_case to camelCase
const toCamelCase = (obj: any) => {
    const newObj: {[key: string]: any} = {};
    for (let key in obj) {
        const newKey = key.replace(/(_\w)/g, (m) => m[1].toUpperCase());
        newObj[newKey] = obj[key];
    }
    return newObj;
};

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
    
    return data.map(v => toCamelCase(v) as StudentVisit);
  },
  
  addVisit: async (visitData: StudentVisitInsert): Promise<StudentVisit> => {
    const newVisit = {
      student_name: visitData.studentName,
      student_id: visitData.studentId,
      symptoms: visitData.symptoms,
      reason: visitData.reason,
      ai_suggestion: visitData.aiSuggestion,
    };

    const { data, error } = await supabase.from('visits').insert(newVisit).select().single();

    if (error) {
      console.error('Error adding visit:', error);
      throw error;
    }

    return toCamelCase(data) as StudentVisit;
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
    return data.map(m => toCamelCase(m) as Medicine);
  },

  dispenseMedicine: async (medicineId: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('dispense_medicine', { med_id: medicineId });

    if (error) {
      console.error('Error dispensing medicine:', error);
      return false;
    }
    return data;
  },

  requestRefill: async (medicineId: string): Promise<boolean> => {
    const { data: medicine, error: findError } = await supabase.from('medicines').select('name').eq('id', medicineId).single();
    
    if (findError || !medicine) {
        console.error('Error finding medicine for refill request:', findError);
        return false;
    }

    const newRequest = {
        medicine_id: medicineId,
        medicine_name: medicine.name,
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
    
    return data.map(a => toCamelCase(a) as Appointment);
  },

  addAppointment: async (apptData: AppointmentInsert): Promise<Appointment> => {
    const newAppt = {
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

    return toCamelCase(data) as Appointment;
  }
};
