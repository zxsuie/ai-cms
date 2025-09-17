import { z } from 'zod';

export const logVisitSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  symptoms: z.string().min(1, 'Symptoms are required'),
  reason: z.string().min(1, 'Reason for visit is required'),
});

export type StudentVisit = {
  id: string;
  timestamp: string;
  studentName: string;
  studentId: string;
  symptoms: string;
  reason: string;
  aiSuggestion: string;
  releaseFormLink?: string;
};

export type Medicine = {
  id: string;
  name: string;
  stock: number;
  threshold: number;
};

export type RefillRequest = {
  id: string;
  medicineId: string;
  medicineName: string;
  requestDate: string;
};
