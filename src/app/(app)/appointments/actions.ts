
'use server';

import type { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { scheduleAppointmentSchema } from '@/lib/types';
import { addMinutes, subMinutes } from 'date-fns';

export async function scheduleAppointment(data: z.infer<typeof scheduleAppointmentSchema>) {
  try {
    const { studentName, studentId, reason, date, time } = data;
    
    const [hours, minutes] = time.split(':').map(Number);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const dateTime = new Date(year, month, day, hours, minutes);

    // Check for overlapping appointments
    const existingAppointments = await db.getAppointments();
    const thirtyMinutesBefore = subMinutes(dateTime, 29); // e.g. 8:31 for a 9:00 appointment
    const thirtyMinutesAfter = addMinutes(dateTime, 29); // e.g. 9:29 for a 9:00 appointment

    const conflict = existingAppointments.find(appt => {
        const apptTime = new Date(appt.dateTime);
        return apptTime > thirtyMinutesBefore && apptTime < thirtyMinutesAfter;
    });

    if (conflict) {
        return { success: false, message: 'This time slot is no longer available. Please select another time.' };
    }

    const newAppointment = await db.addAppointment({
      studentName,
      studentId,
      reason,
      dateTime: dateTime.toISOString(),
    });

    await db.addActivityLog('appointment_scheduled', { 
      studentName, 
      studentId,
      appointmentId: newAppointment.id,
      dateTime: newAppointment.dateTime
    });

    revalidatePath('/appointments');
    revalidatePath('/logs');
    return { success: true, message: 'Appointment scheduled successfully.' };
  } catch (error) {
    console.error('Failed to schedule appointment:', error);
    return { success: false, message: 'Failed to schedule appointment.' };
  }
}
