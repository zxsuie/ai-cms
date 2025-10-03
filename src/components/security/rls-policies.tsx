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
import { RlsToggle } from './rls-toggle';


// This is a simplified list. In a real scenario, you might fetch this dynamically.
const tables = [
    'visits',
    'medicines',
    'appointments',
    'activity_logs',
    'refill_requests',
];

export async function RlsPolicies() {
    const tablePolicies = await Promise.all(tables.map(async (table) => {
        const { data, error } = await db.supabase.rpc('is_rls_enabled', { table_name: table });
        const isEnabled = error ? false : data;
        return { name: table, rlsEnabled: isEnabled };
    }));

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Table</TableHead>
            <TableHead>RLS Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tablePolicies.map((table) => (
            <TableRow key={table.name}>
              <TableCell className="font-mono">{table.name}</TableCell>
              <TableCell>
                {table.rlsEnabled ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Enabled</Badge>
                ) : (
                  <Badge variant="destructive">Disabled</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <RlsToggle table={table.name} isEnabled={table.rlsEnabled} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
