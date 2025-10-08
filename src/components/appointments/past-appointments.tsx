
'use client';

import { useAppointments } from "@/hooks/use-appointments";
import { Appointment } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { parse, format, compareDesc } from "date-fns";
import { useUser } from "@/hooks/use-user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function PastAppointments() {
  const { user, loading: userLoading } = useUser();
  const { appointments, loading: appointmentsLoading } = useAppointments({
    filter: 'user',
    userName: user?.fullName
  });
  const loading = userLoading || appointmentsLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const pastAppointments = appointments
    .map(appt => ({
      ...appt,
      dateTime: parse(`${appt.appointmentDate}T${appt.appointmentTime}`, 'yyyy-MM-dd\'T\'HH:mm', new Date()),
    }))
    .filter(appt => {
        const now = new Date();
        return appt.dateTime < now;
    })
    .sort((a, b) => compareDesc(a.dateTime, b.dateTime));
    
  if (pastAppointments.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No past appointments found.</p>;
  }

  return (
     <div className="w-full overflow-x-auto rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Reason</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {pastAppointments.map((appt: Appointment) => (
                <TableRow key={appt.id}>
                    <TableCell>{format(parse(appt.appointmentDate, 'yyyy-MM-dd', new Date()), 'PP')}</TableCell>
                    <TableCell>{format(new Date(`1970-01-01T${appt.appointmentTime}`), 'p')}</TableCell>
                    <TableCell>{appt.reason}</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    </div>
  );
}
