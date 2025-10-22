
'use server';

import type { z } from 'zod';
import { db } from '@/lib/db';
import type { scheduleAppointmentSchema } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { formatInTimeZone } from 'date-fns-tz';

export async function scheduleAppointment(data: z.infer<typeof scheduleAppointmentSchema>) {
  try {
    const { studentName, studentYear, studentSection, reason, date, time, userId } = data;
    
    // Format the date correctly for the database, ensuring it's not affected by timezone shifts on the server.
    const appointmentDate = formatInTimeZone(date, 'UTC', 'yyyy-MM-dd');
    const appointmentTime = time;

    // Check for overlapping appointments
    const existingAppointments = await db.getAppointments();
    
    const conflict = existingAppointments.find(appt => {
        return appt.appointmentDate === appointmentDate && appt.appointmentTime === appointmentTime;
    });

    if (conflict) {
        return { success: false, message: 'This time slot is no longer available. Please select another time.' };
    }

    const newAppointment = await db.addAppointment({
      userId,
      studentName,
      studentYear,
      studentSection,
      reason,
      appointmentDate,
      appointmentTime,
    });

    await db.addActivityLog('appointment_scheduled', { 
      studentName, 
      appointmentId: newAppointment.id,
      date: newAppointment.appointmentDate,
      time: newAppointment.appointmentTime
    });
    
    revalidatePath('/appointments');
    revalidatePath('/logs');
    
    return { success: true, message: 'Appointment scheduled successfully.' };
  } catch (error) {
    console.error('Failed to schedule appointment:', error);
    return { success: false, message: 'Failed to schedule appointment.' };
  }
}
