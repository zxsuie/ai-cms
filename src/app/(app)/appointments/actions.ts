'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const scheduleAppointmentSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  reason: z.string().min(1, 'Reason for appointment is required'),
  date: z.date({ required_error: 'Please select a date.' }),
  time: z.string().min(1, 'Please select a time.'),
});

export async function scheduleAppointment(data: z.infer<typeof scheduleAppointmentSchema>) {
  try {
    const { studentName, studentId, reason, date, time } = data;
    
    // Combine date and time
    const [hours, minutes] = time.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes);

    await db.addAppointment({
      studentName,
      studentId,
      reason,
      dateTime: dateTime.toISOString(),
    });

    revalidatePath('/appointments');
    return { success: true, message: 'Appointment scheduled successfully.' };
  } catch (error) {
    console.error('Failed to schedule appointment:', error);
    return { success: false, message: 'Failed to schedule appointment.' };
  }
}
