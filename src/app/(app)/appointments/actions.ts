
'use server';

import type { z } from 'zod';
import { db } from '@/lib/db';
import type { scheduleAppointmentSchema } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { format, parseISO } from 'date-fns';

export async function scheduleAppointment(data: z.infer<typeof scheduleAppointmentSchema>) {
  try {
    const { date, ...restOfData } = data;
    
    // The 'date' comes from the client as a Date object, so it must be formatted.
    const appointmentDate = format(date, 'yyyy-MM-dd');

    const appointmentPayload = {
      ...restOfData,
      appointmentDate,
    };
    
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
