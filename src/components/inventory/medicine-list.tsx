import { db } from '@/lib/db';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MedicineActions } from './medicine-actions';

export async function MedicineList() {
  const medicines = await db.getMedicines();

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Medicine</TableHead>
            <TableHead>Stock Level</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medicines.map((med) => {
            const isLowStock = med.stock < med.threshold;
            const stockPercentage = Math.min((med.stock / (med.threshold * 2)) * 100, 100);

            return (
              <TableRow key={med.id}>
                <TableCell className="font-medium">{med.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <span>{med.stock}</span>
                    <Progress value={stockPercentage} className="w-24 hidden lg:block" />
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {isLowStock ? (
                    <Badge variant="destructive">Low Stock</Badge>
                  ) : (
                    <Badge variant="secondary">In Stock</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <MedicineActions medicine={med} isLowStock={isLowStock} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
