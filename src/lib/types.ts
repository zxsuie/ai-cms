
import { z } from 'zod';

export const logVisitSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  studentId: z.string().min(1, 'Student ID is required').max(8, 'Student ID cannot exceed 8 characters'),
  studentYear: z.string().min(1, 'Year level is required'),
  studentSection: z.string().min(1, 'Section is required'),
  symptoms: z.string().min(1, 'Symptoms are required'),
  reason: z.string().min(1, 'Reason for visit is required'),
});

export const scheduleAppointmentSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  studentId: z.string().min(1, 'Student ID is required').max(8, 'Student ID cannot exceed 8 characters'),
  studentYear: z.string().min(1, 'Year level is required'),
  studentSection: z.string().min(1, 'Section is required'),
  reason: z.string().min(1, 'Reason for appointment is required'),
  date: z.date({ required_error: 'Please select a date.' }),
  time: z.string().min(1, 'Please select a time.'),
});

export const addMedicineSchema = z.object({
    name: z.string().min(1, 'Medicine name is required.'),
    stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer.'),
    threshold: z.coerce.number().int().min(0, 'Threshold must be a non-negative integer.'),
});

export type StudentVisit = {
  id: string; // UUID
  timestamp: string;
  studentName: string;
  studentId: string;
  studentYear: string;
  studentSection: string;
  symptoms: string;
  reason: string;
  aiSuggestion: string;
  releaseFormLink?: string;
};

export type Medicine = {
  id: string; // UUID
  name: string;
  stock: number;
  threshold: number;
};

export type MedicineInsert = Omit<Medicine, 'id'>;

export type RefillRequest = {
  id: string; // UUID
  medicineId: string; // UUID
  medicineName: string;
  requestDate: string;
};

export type Appointment = {
  id: string; // UUID
  studentName: string;
  studentId: string;
  studentYear: string;
  studentSection: string;
  reason: string;
  dateTime: string;
};

export type ActivityLog = {
  id: string; // UUID
  timestamp: string;
  userName: string;
  actionType: string;
  details: Record<string, any>;
};
