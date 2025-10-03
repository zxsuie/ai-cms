
'use server';

import type { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { scheduleAppointmentSchema } from '@/lib/types';
import { addMinutes, subMinutes } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

export async function scheduleAppointment(data: z.infer<typeof scheduleAppointmentSchema>) {
  try {
    const { studentName, studentId, studentYear, studentSection, reason, date, time } = data;
    
    // This should always be 'Asia/Manila' as per user requirement.
    const timeZone = 'Asia/Manila'; 
    const [hours, minutes] = time.split(':').map(Number);
    
    // Correctly interpret the client's date in the target timezone.
    // This creates a Date object that represents the exact moment the user intended,
    // regardless of the server's local timezone.
    let zonedTime = fromZonedTime(date, timeZone);
    zonedTime.setHours(hours, minutes, 0, 0);

    // Convert to ISO string (which will be in UTC 'Z' format) for database storage.
    const dateTime = zonedTime.toISOString();

    // Check for overlapping appointments using the correct zoned time
    const existingAppointments = await db.getAppointments();
    const thirtyMinutesBefore = subMinutes(zonedTime, 29);
    const thirtyMinutesAfter = addMinutes(zonedTime, 29);

    const conflict = existingAppointments.find(appt => {
        const apptTime = new Date(appt.dateTime); // DB time is in UTC, new Date() correctly parses it.
        return apptTime >= thirtyMinutesBefore && apptTime <= thirtyMinutesAfter;
    });

    if (conflict) {
        return { success: false, message: 'This time slot is no longer available. Please select another time.' };
    }

    // Pass the correct ISO string to the database layer.
    const newAppointment = await db.addAppointment({
      studentName,
      studentId,
      studentYear,
      studentSection,
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
