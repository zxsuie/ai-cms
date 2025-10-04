
'use server';

import type { z } from 'zod';
import { db } from '@/lib/db';
import type { scheduleAppointmentSchema } from '@/lib/types';
import { addMinutes, subMinutes, parseISO } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';

export async function scheduleAppointment(data: z.infer<typeof scheduleAppointmentSchema>) {
  try {
    const { studentName, studentYear, studentSection, reason, date, time } = data;
    
    // Combine date and time into a simple, timezone-unaware ISO-like string.
    const dateTimeString = `${format(date, 'yyyy-MM-dd')}T${time}:00`;
    const newAppointmentDateTime = parseISO(dateTimeString);

    // Check for overlapping appointments
    const existingAppointments = await db.getAppointments();
    const thirtyMinutesBefore = subMinutes(newAppointmentDateTime, 29);
    const thirtyMinutesAfter = addMinutes(newAppointmentDateTime, 29);

    const conflict = existingAppointments.find(appt => {
        const apptTime = parseISO(appt.dateTime); // Parse the stored string
        return apptTime >= thirtyMinutesBefore && apptTime <= thirtyMinutesAfter;
    });

    if (conflict) {
        return { success: false, message: 'This time slot is no longer available. Please select another time.' };
    }

    // Pass the simple ISO string to the database layer.
    const newAppointment = await db.addAppointment({
      studentName,
      studentYear,
      studentSection,
      reason,
      dateTime: dateTimeString, 
    });

    await db.addActivityLog('appointment_scheduled', { 
      studentName, 
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
