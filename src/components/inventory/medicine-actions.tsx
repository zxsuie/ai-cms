'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { dispenseMedicineAction, requestRefillAction } from '@/app/(app)/inventory/actions';
import { Medicine } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MinusCircle, PlusCircle } from 'lucide-react';

export function MedicineActions({ medicine, isLowStock }: { medicine: Medicine; isLowStock: boolean }) {
  const [isDispensePending, startDispenseTransition] = useTransition();
  const [isRefillPending, startRefillTransition] = useTransition();
  const { toast } = useToast();

  const handleDispense = () => {
    startDispenseTransition(async () => {
      const result = await dispenseMedicineAction(medicine.id);
      if (result.success) {
        toast({
          title: `Dispensed ${medicine.name}`,
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

  return (
    <div className="flex gap-2 justify-end">
      {isLowStock && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefill}
          disabled={isRefillPending}
          className="text-accent-foreground border-accent hover:bg-accent/90 bg-accent hover:text-accent-foreground"
        >
          {isRefillPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">Refill</span>
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={handleDispense} disabled={isDispensePending || medicine.stock === 0}>
        {isDispensePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MinusCircle className="h-4 w-4" />}
        <span className="ml-2 hidden sm:inline">Dispense</span>
      </Button>
    </div>
  );
}
