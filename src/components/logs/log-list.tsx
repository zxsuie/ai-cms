import { db } from '@/lib/db';
import { ActivityLog } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LogFilters } from './log-filters';
import { cn } from '@/lib/utils';

interface LogListProps {
  query: string;
  actionType: string;
}

const actionTypeBadges: Record<string, string> = {
  visit_logged: 'bg-blue-100 text-blue-800',
  appointment_scheduled: 'bg-purple-100 text-purple-800',
  medicine_dispensed: 'bg-yellow-100 text-yellow-800',
  stock_updated: 'bg-green-100 text-green-800',
  refill_requested: 'bg-orange-100 text-orange-800',
  report_generated: 'bg-indigo-100 text-indigo-800',
  medicine_deleted: 'bg-red-100 text-red-800',
  release_form_generated: 'bg-pink-100 text-pink-800',
};

function formatActionType(type: string) {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function LogList({ query, actionType }: LogListProps) {
  const logs = await db.getActivityLogs({ query, actionType });

  const uniqueActionTypes = [
    ...new Set((await db.getActivityLogs()).map(log => log.actionType))
  ];

  return (
    <div className="space-y-4">
      <LogFilters actionTypes={uniqueActionTypes} />
      
      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log: ActivityLog) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString('en-US', {
                    timeZone: 'Asia/Manila',
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </TableCell>
                <TableCell>{log.userName}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn('whitespace-nowrap', actionTypeBadges[log.actionType] || 'bg-gray-100 text-gray-800')}>
                    {formatActionType(log.actionType)}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {Object.entries(log.details)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {logs.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
                No logs found for the current filters.
            </div>
        )}
      </div>
    </div>
  );
}
