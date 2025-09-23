
'use server';

import type { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { scheduleAppointmentSchema } from '@/lib/types';

export async function scheduleAppointment(data: z.infer<typeof scheduleAppointmentSchema>) {
  try {
    const { studentName, studentId, reason, date, time } = data;
    
    // Combine date and time reliably to prevent timezone issues
    const [hours, minutes] = time.split(':').map(Number);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const dateTime = new Date(year, month, day, hours, minutes);

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
