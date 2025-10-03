'use client';

import { useAppointments } from "@/hooks/use-appointments";
import { Appointment } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { isToday } from "date-fns";

export function UpcomingAppointments() {
  const { appointments, loading } = useAppointments();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const upcoming = appointments
    .filter(appt => {
        const apptDate = new Date(appt.dateTime);
        // We only want appointments for today that haven't passed yet.
        return isToday(apptDate) && apptDate >= new Date();
    })
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  if (upcoming.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No upcoming appointments for today.</p>;
  }

  return (
    <div className="space-y-4">
      {upcoming.map((appt: Appointment) => (
        <div key={appt.id} className="p-3 bg-secondary rounded-lg">
          <p className="font-semibold">{appt.studentName}</p>
          <p className="text-sm text-muted-foreground">{appt.reason}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(appt.dateTime).toLocaleString('en-US', { 
              timeZone: 'Asia/Manila', 
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            })}
          </p>
        </div>
      ))}
    </div>
  );
}
