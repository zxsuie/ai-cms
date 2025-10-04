
'use client';

import { useAppointments } from "@/hooks/use-appointments";
import { Appointment } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { isToday, parse, format } from "date-fns";

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
        const apptDate = parse(appt.appointmentDate, 'yyyy-MM-dd', new Date());
        const now = new Date();
        // Check if the appointment is today and hasn't passed yet
        if (!isToday(apptDate)) return false;
        
        const [hour, minute] = appt.appointmentTime.split(':').map(Number);
        const apptTime = new Date();
        apptTime.setHours(hour, minute, 0, 0);

        return apptTime >= now;
    })
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

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
            {format(new Date(`1970-01-01T${appt.appointmentTime}`), 'hh:mm a')}
          </p>
        </div>
      ))}
    </div>
  );
}
