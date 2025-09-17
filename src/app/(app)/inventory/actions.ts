'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function dispenseMedicineAction(medicineId: string) {
  try {
    const success = await db.dispenseMedicine(medicineId);
    if (success) {
      revalidatePath('/inventory');
      return { success: true, message: 'Medicine dispensed.' };
    }
    return { success: false, message: 'Failed to dispense: Out of stock or not found.' };
  } catch (error) {
    return { success: false, message: 'An error occurred while dispensing.' };
  }
}

export async function requestRefillAction(medicineId: string) {
  try {
    const success = await db.requestRefill(medicineId);
    if (success) {
      // In a real app, this would also trigger a notification/email.
      // For now, we just show a success message.
      revalidatePath('/inventory');
      return { success: true, message: 'Refill requested successfully.' };
    }
    return { success: false, message: 'Failed to request refill.' };
  } catch (error) {
    return { success: false, message: 'An error occurred during the request.' };
  }
}
