
'use server';

import type { z } from 'zod';
import { db } from '@/lib/db';
import type { scheduleAppointmentSchema } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';

export async function scheduleAppointment(data: z.infer<typeof scheduleAppointmentSchema>) {
  try {
    // The 'date' from the form is a Date object. Format it for the database.
    const appointmentPayload = {
      ...data,
      appointmentDate: format(data.date, 'yyyy-MM-dd'),
      appointmentTime: data.time,
    };
    
    // The db.addAppointment function now handles conflict checking and insertion.
    // We pass the entire validated data payload.
    const newAppointment = await db.addAppointment(appointmentPayload);

    await db.addActivityLog('appointment_scheduled', { 
      studentName: newAppointment.studentName, 
      appointmentId: newAppointment.id,
      date: newAppointment.appointmentDate,
      time: newAppointment.appointmentTime
    });
    
    revalidatePath('/appointments');
    revalidatePath('/logs');
    
    return { success: true, message: 'Appointment scheduled successfully.' };
  } catch (error: any) {
    console.error('Failed to schedule appointment:', error);
    if (error.message === 'SLOT_TAKEN') {
      return { success: false, message: 'This time slot is no longer available. Please select another time.' };
    }
    return { success: false, message: 'Failed to schedule appointment.' };
  }
}
