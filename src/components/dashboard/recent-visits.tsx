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
import { ReleaseFormButton } from './release-form-button';
import { StudentVisit } from '@/lib/types';

export async function RecentVisits() {
  const visits = await db.getVisits();

  if (visits.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No visits logged yet.</p>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="hidden md:table-cell">Symptoms</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visits.slice(0, 5).map((visit) => (
            <TableRow key={visit.id}>
              <TableCell>
                <div className="font-medium">{visit.studentName}</div>
                <div className="text-sm text-muted-foreground">{visit.studentId}</div>
              </TableCell>
              <TableCell>
                {new Date(visit.timestamp).toLocaleTimeString('en-US', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' })}
              </TableCell>
              <TableCell className="hidden md:table-cell max-w-xs truncate">{visit.symptoms}</TableCell>
              <TableCell className="text-right">
                <ReleaseFormButton visit={visit} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
