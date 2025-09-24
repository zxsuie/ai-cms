
import { z } from 'zod';

export const logVisitSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  studentId: z.string().min(1, 'Student ID is required').max(8, 'Student ID cannot exceed 8 characters'),
  symptoms: z.string().min(1, 'Symptoms are required'),
  reason: z.string().min(1, 'Reason for visit is required'),
});

export const scheduleAppointmentSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  studentId: z.string().min(1, 'Student ID is required').max(8, 'Student ID cannot exceed 8 characters'),
  reason: z.string().min(1, 'Reason for appointment is required'),
  date: z.date({ required_error: 'Please select a date.' }),
  time: z.string().min(1, 'Please select a time.'),
});

export type StudentVisit = {
  id: string; // UUID
  timestamp: string;
  studentName: string;
  studentId: string;
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
  reason: string;
  dateTime: string;
};
