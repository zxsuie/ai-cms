import { MedicineList } from '@/components/inventory/medicine-list';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Medicine Inventory</h1>
        <p className="text-muted-foreground">Track and manage medicine stock levels.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Stock Overview</CardTitle>
          <CardDescription>View current stock, dispense medicine, and request refills.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <MedicineList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
