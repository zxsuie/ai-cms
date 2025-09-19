'use server';

import type { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { scheduleAppointmentSchema } from '@/lib/types';

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
