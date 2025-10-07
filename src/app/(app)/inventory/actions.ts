
'use server';

import {db} from '@/lib/db';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import { addMedicineSchema } from '@/lib/types';

const updateStockSchema = z.object({
  id: z.string().uuid(),
  stock: z.number().min(0, 'Stock cannot be negative.'),
});

const dispenseMedicineSchema = z.object({
  id: z.string().uuid(),
  quantity: z.coerce
    .number({invalid_type_error: 'Please enter a valid number.'})
    .int()
    .positive('Quantity must be greater than zero.'),
});

export async function addMedicineAction(data: z.infer<typeof addMedicineSchema>, userName: string) {
  try {
    const newMedicine = await db.addMedicine(data);
    await db.addActivityLog('medicine_added', { 
      medicineId: newMedicine.id,
      medicineName: newMedicine.name,
      initialStock: newMedicine.stock,
    }, userName);
    revalidatePath('/inventory');
    revalidatePath('/logs');
    return { success: true, message: `${newMedicine.name} added to inventory.` };
  } catch (error) {
    console.error('Failed to add medicine:', error);
    return { success: false, message: 'Failed to add new medicine.' };
  }
}

export async function dispenseMedicineAction(data: z.infer<typeof dispenseMedicineSchema>, userName: string) {
  const validated = dispenseMedicineSchema.safeParse(data);
  if (!validated.success) {
    return {success: false, message: 'Invalid input.'};
  }

  try {
    const {id, quantity} = validated.data;
    const medicine = await db.getMedicineById(id);

    if (!medicine) {
      return { success: false, message: 'Medicine not found.' };
    }
    if (medicine.stock < quantity) {
      return { success: false, message: `Not enough stock. Only ${medicine.stock} items available.` };
    }

    const newStock = medicine.stock - quantity;
    const success = await db.updateMedicineStock(id, newStock);

    if (success) {
      await db.addActivityLog('medicine_dispensed', { 
        medicineId: medicine.id, 
        medicineName: medicine.name,
        dispensedQuantity: quantity,
        newStock: newStock,
      }, userName);
      revalidatePath('/inventory');
      revalidatePath('/logs');
      return {success: true, message: `Dispensed ${quantity} of ${medicine.name}.`};
    }
    return {
      success: false,
      message: 'Failed to dispense medicine.',
    };
  } catch (error) {
    console.error('Error dispensing medicine:', error)
    return {success: false, message: 'An error occurred while dispensing.'};
  }
}

export async function requestRefillAction(medicineId: string, userName: string) {
  try {
     const medicine = await db.getMedicineById(medicineId);
    if (!medicine) {
      return { success: false, message: 'Medicine not found.' };
    }

    const success = await db.requestRefill(medicineId);
    if (success) {
      await db.addActivityLog('refill_requested', { medicineId: medicine.id, medicineName: medicine.name }, userName);
      revalidatePath('/inventory');
      revalidatePath('/logs');
      return {success: true, message: 'Refill requested successfully.'};
    }
    return {success: false, message: 'Failed to request refill.'};
  } catch (error) {
    return {success: false, message: 'An error occurred during the request.'};
  }
}

export async function updateMedicineStockAction(
  data: z.infer<typeof updateStockSchema>,
  userName: string
) {
  const validated = updateStockSchema.safeParse(data);
  if (!validated.success) {
    return {success: false, message: 'Invalid input.'};
  }

  try {
    const medicine = await db.getMedicineById(validated.data.id);
    if (!medicine) {
      return { success: false, message: 'Medicine not found.' };
    }

    const success = await db.updateMedicineStock(
      validated.data.id,
      validated.data.stock
    );
    if (success) {
      await db.addActivityLog('stock_updated', { 
        medicineId: medicine.id, 
        medicineName: medicine.name,
        oldStock: medicine.stock,
        newStock: validated.data.stock
      }, userName);
      revalidatePath('/inventory');
      revalidatePath('/logs');
      return {success: true, message: 'Stock updated successfully.'};
    }
    return {success: false, message: 'Failed to update stock.'};
  } catch (error) {
    return {success: false, message: 'An error occurred while updating.'};
  }
}

export async function deleteMedicineAction(medicineId: string, userName: string) {
  try {
    const medicine = await db.getMedicineById(medicineId);
    if (!medicine) {
      // Already deleted or never existed
      return { success: true, message: 'Medicine deleted.' };
    }

    const success = await db.deleteMedicine(medicineId);
    if (success) {
      await db.addActivityLog('medicine_deleted', { medicineId: medicine.id, medicineName: medicine.name }, userName);
      revalidatePath('/inventory');
      revalidatePath('/logs');
      return {success: true, message: 'Medicine deleted.'};
    }
    return {success: false, message: 'Failed to delete medicine.'};
  } catch (error) {
    return {success: false, message: 'An error occurred during deletion.'};
  }
}
