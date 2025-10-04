
'use client';

import {useState, useTransition} from 'react';
import {Button} from '@/components/ui/button';
import {
  dispenseMedicineAction,
  requestRefillAction,
  updateMedicineStockAction,
  deleteMedicineAction,
} from '@/app/(app)/inventory/actions';
import {Medicine} from '@/lib/types';
import {useToast} from '@/hooks/use-toast';
import {
  Loader2,
  MinusCircle,
  PlusCircle,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';

const updateStockSchema = z.object({
  stock: z.coerce
    .number({invalid_type_error: 'Please enter a valid number.'})
    .int()
    .min(0, 'Stock cannot be negative.'),
});

const dispenseSchema = z.object({
  quantity: z.coerce
    .number({invalid_type_error: 'Please enter a valid number.'})
    .int()
    .positive('Quantity must be greater than zero.'),
});

export function MedicineActions({
  medicine,
  isLowStock,
}: {
  medicine: Medicine;
  isLowStock: boolean;
}) {
  const [isDispensePending, startDispenseTransition] = useTransition();
  const [isRefillPending, startRefillTransition] = useTransition();
  const [isEditPending, startEditTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const {toast} = useToast();

  const [isEditOpen, setEditOpen] = useState(false);
  const [isDispenseOpen, setDispenseOpen] = useState(false);

  const editForm = useForm<z.infer<typeof updateStockSchema>>({
    resolver: zodResolver(updateStockSchema),
    defaultValues: {
      stock: medicine.stock,
    },
  });

  const dispenseForm = useForm<z.infer<typeof dispenseSchema>>({
    resolver: zodResolver(dispenseSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  function onDispenseSubmit(values: z.infer<typeof dispenseSchema>) {
    startDispenseTransition(async () => {
      const result = await dispenseMedicineAction({
        id: medicine.id,
        quantity: values.quantity,
      });
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        setDispenseOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    });
  };

  const handleRefill = () => {
    startRefillTransition(async () => {
      const result = await requestRefillAction(medicine.id);
      if (result.success) {
        toast({
          title: 'Refill Requested',
          description: `A request for ${medicine.name} has been sent.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    });
  };

  function onEditSubmit(values: z.infer<typeof updateStockSchema>) {
    startEditTransition(async () => {
      const result = await updateMedicineStockAction({
        id: medicine.id,
        stock: values.stock,
      });
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        setEditOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    });
  }

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteMedicineAction(medicine.id);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    });
  };

  return (
    <>
      <div className="flex gap-2 justify-end">
        {isLowStock && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefill}
            disabled={isRefillPending}
            className="text-accent-foreground border-accent hover:bg-accent/90 bg-accent hover:text-accent-foreground"
          >
            {isRefillPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Refill</span>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            dispenseForm.reset({ quantity: 1 });
            setDispenseOpen(true);
          }}
          disabled={medicine.stock === 0}
        >
          <MinusCircle className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">Dispense</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => {
            editForm.reset({stock: medicine.stock});
            setEditOpen(true);
          }}
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the medicine
                "{medicine.name}" from the inventory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeletePending} className="bg-destructive hover:bg-destructive/90">
                {isDeletePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stock for {medicine.name}</DialogTitle>
            <DialogDescription>
              Update the current stock quantity for this medicine.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={editForm.control}
                name="stock"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>New Stock Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isEditPending}>
                  {isEditPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDispenseOpen} onOpenChange={setDispenseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispense {medicine.name}</DialogTitle>
            <DialogDescription>
              Enter the quantity to dispense. Current stock: {medicine.stock}
            </DialogDescription>
          </DialogHeader>
          <Form {...dispenseForm}>
            <form
              onSubmit={dispenseForm.handleSubmit(onDispenseSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={dispenseForm.control}
                name="quantity"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isDispensePending}>
                  {isDispensePending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm Dispense
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
