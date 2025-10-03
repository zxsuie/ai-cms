'use client';

import { useAppointments } from "@/hooks/use-appointments";
import { Appointment } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

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
    .filter(appt => new Date(appt.dateTime) >= new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  if (upcoming.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No upcoming appointments.</p>;
  }

  return (
    <div className="space-y-4">
      {upcoming.slice(0, 5).map((appt: Appointment) => (
        <div key={appt.id} className="p-3 bg-secondary rounded-lg">
          <p className="font-semibold">{appt.studentName}</p>
          <p className="text-sm text-muted-foreground">{appt.reason}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(appt.dateTime).toLocaleString('en-US', { 
              timeZone: 'Asia/Manila', 
              dateStyle: 'medium', 
              timeStyle: 'short' 
            })}
          </p>
        </div>
      ))}
    </div>
  );
}
