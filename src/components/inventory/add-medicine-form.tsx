
'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addMedicineSchema } from '@/lib/types';
import { addMedicineAction } from '@/app/(app)/inventory/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';

type MedicineFormValues = z.infer<typeof addMedicineSchema>;

export function AddMedicineForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(addMedicineSchema),
    defaultValues: {
      name: '',
      stock: 0,
      threshold: 10,
    },
  });

  function onSubmit(data: MedicineFormValues) {
    if (!user) {
      toast({
          variant: 'destructive',
          title: 'Error',
          description: 'You must be logged in to perform this action.',
      });
      return;
    }
    startTransition(async () => {
      const result = await addMedicineAction(data, user.fullName || user.email || 'Unknown User');
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Medicine</CardTitle>
        <CardDescription>Add a new item to the inventory.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicine Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Paracetamol" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Stock</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low Stock Threshold</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Medicine
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
