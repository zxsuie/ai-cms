
'use client';

import { useAppointments } from "@/hooks/use-appointments";
import { Appointment } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { isToday, parseISO, format } from "date-fns";

export function UpcomingAppointments() {
  const { appointments, loading } = useAppointments();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const upcoming = appointments
    .filter(appt => {
        const apptDate = parseISO(appt.dateTime);
        const now = new Date();
        // Check if the appointment is today and hasn't passed yet
        return isToday(apptDate) && apptDate >= now;
    })
    .sort((a, b) => parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime());

  if (upcoming.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No upcoming appointments for today.</p>;
  }

  return (
    <div className="space-y-4">
      {upcoming.map((appt: Appointment) => (
        <div key={appt.id} className="p-3 bg-secondary rounded-lg">
          <p className="font-semibold">{appt.studentName}</p>
          <p className="text-xs text-muted-foreground">{appt.studentYear} - {appt.studentSection}</p>
          <p className="text-sm text-muted-foreground mt-1">{appt.reason}</p>
          <p className="text-xs font-medium text-primary mt-1">
            {format(parseISO(appt.dateTime), 'hh:mm a')}
          </p>
        </div>
      ))}
    </div>
  );
}
