
'use server';

import type { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { scheduleAppointmentSchema } from '@/lib/types';
import { addMinutes, subMinutes } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

export async function scheduleAppointment(data: z.infer<typeof scheduleAppointmentSchema>) {
  try {
    const { studentName, studentId, reason, date, time } = data;
    
    const timeZone = 'Asia/Manila';
    const [hours, minutes] = time.split(':').map(Number);
    
    // This is the corrected logic.
    // It takes the date from the client and correctly interprets it in the 'Asia/Manila' timezone,
    // regardless of the server's local timezone. Then it sets the correct time.
    let zonedTime = fromZonedTime(date, timeZone);
    zonedTime.setHours(hours, minutes, 0, 0);

    const dateTime = zonedTime.toISOString();

    // Check for overlapping appointments (using the correctly zoned time)
    const existingAppointments = await db.getAppointments();
    const thirtyMinutesBefore = subMinutes(zonedTime, 29);
    const thirtyMinutesAfter = addMinutes(zonedTime, 29);

    const conflict = existingAppointments.find(appt => {
        const apptTime = new Date(appt.dateTime);
        return apptTime >= thirtyMinutesBefore && apptTime <= thirtyMinutesAfter;
    });

    if (conflict) {
        return { success: false, message: 'This time slot is no longer available. Please select another time.' };
    }

    const newAppointment = await db.addAppointment({
      studentName,
      studentId,
      reason,
      dateTime: dateTime,
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
