
import { z } from 'zod';

export const logVisitSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  studentYear: z.string().min(1, 'Year level is required'),
  studentSection: z.string().min(1, 'Section is required'),
  symptoms: z.string().min(1, 'Symptoms are required'),
  reason: z.string().min(1, 'Reason for visit is required'),
});

export const scheduleAppointmentSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  studentYear: z.string().min(1, 'Year/Course or Department is required'),
  studentSection: z.string().min(1, 'Section or Job Title is required'),
  reason: z.string().min(1, 'Reason for appointment is required'),
  date: z.date({ required_error: 'Please select a date.' }),
  time: z.string().min(1, 'Please select a time.'),
});

export const addMedicineSchema = z.object({
    name: z.string().min(1, 'Medicine name is required.'),
    stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer.'),
    threshold: z.coerce.number().int().min(0, 'Threshold must be a non-negative integer.'),
});

// Base schema for common fields, including password confirmation
const baseUserSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters long'),
});

// Schemas for each specific role, extending the base schema
const studentSchema = baseUserSchema.extend({
  role: z.literal('student'),
  course: z.string().min(1, 'Course is required'),
  studentSection: z.string().min(1, 'Section is required'),
});

const employeeSchema = baseUserSchema.extend({
  role: z.literal('employee'),
  department: z.string().min(1, 'Department is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
});

const staffSchema = baseUserSchema.extend({
  role: z.literal('staff'),
  department: z.string().min(1, 'Department is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
});

// This schema will be used for the new dynamic signup form
export const signupSchema = z.discriminatedUnion('role', [
  studentSchema,
  employeeSchema,
  staffSchema,
]).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // Set the error on the confirm password field
});


export type StudentVisit = {
  id: string; // UUID
  timestamp: string;
  studentName: string;
  studentYear: string;
  studentSection: string;
  symptoms: string;
  reason: string;
  aiSuggestion: string;
  releaseFormLink?: string;
  excuseLetterText?: string;
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
  studentYear: string;
  studentSection: string;
  reason: string;
  appointmentDate: string;
  appointmentTime: string;
};

export type ActivityLog = {
  id: string; // UUID
  timestamp: string;
  userName: string;
  actionType: string;
  details: Record<string, any>;
};

export type Profile = {
    id: string; // UUID
    email: string;
    fullName?: string;
    avatarUrl?: string;
    role: 'admin' | 'super_admin' | 'student' | 'employee' | 'staff';
    course?: string;
    studentSection?: string;
    department?: string;
    jobTitle?: string;
}
