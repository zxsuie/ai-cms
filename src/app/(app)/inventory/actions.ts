'use server';

import {db} from '@/lib/db';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';

const updateStockSchema = z.object({
  id: z.string().uuid(),
  stock: z.number().min(0, 'Stock cannot be negative.'),
});

export async function dispenseMedicineAction(medicineId: string) {
  try {
    const success = await db.dispenseMedicine(medicineId);
    if (success) {
      revalidatePath('/inventory');
      return {success: true, message: 'Medicine dispensed.'};
    }
    return {
      success: false,
      message: 'Failed to dispense: Out of stock or not found.',
    };
  } catch (error) {
    return {success: false, message: 'An error occurred while dispensing.'};
  }
}

export async function requestRefillAction(medicineId: string) {
  try {
    const success = await db.requestRefill(medicineId);
    if (success) {
      // In a real app, this would also trigger a notification/email.
      // For now, we just show a success message.
      revalidatePath('/inventory');
      return {success: true, message: 'Refill requested successfully.'};
    }
    return {success: false, message: 'Failed to request refill.'};
  } catch (error) {
    return {success: false, message: 'An error occurred during the request.'};
  }
}

export async function updateMedicineStockAction(
  data: z.infer<typeof updateStockSchema>
) {
  const validated = updateStockSchema.safeParse(data);
  if (!validated.success) {
    return {success: false, message: 'Invalid input.'};
  }

  try {
    const success = await db.updateMedicineStock(
      validated.data.id,
      validated.data.stock
    );
    if (success) {
      revalidatePath('/inventory');
      return {success: true, message: 'Stock updated successfully.'};
    }
    return {success: false, message: 'Failed to update stock.'};
  } catch (error) {
    return {success: false, message: 'An error occurred while updating.'};
  }
}

export async function deleteMedicineAction(medicineId: string) {
  try {
    const success = await db.deleteMedicine(medicineId);
    if (success) {
      revalidatePath('/inventory');
      return {success: true, message: 'Medicine deleted.'};
    }
    return {success: false, message: 'Failed to delete medicine.'};
  } catch (error) {
    return {success: false, message: 'An error occurred during deletion.'};
  }
}
