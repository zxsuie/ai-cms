
'use client';

import { useAppointments } from "@/hooks/use-appointments";
import { Appointment } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { parse, format, compareAsc } from "date-fns";
import { useUser } from "@/hooks/use-user";

export function UpcomingAppointments() {
  const { user, isAdmin, loading: userLoading } = useUser();
  const { appointments, loading: appointmentsLoading } = useAppointments({
    filter: isAdmin ? 'all' : 'user',
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

  // Filter for appointments that are today or in the future
  const futureAppointments = appointments
    .map(appt => ({
      ...appt,
      // Combine date and time for accurate sorting and filtering
      dateTime: parse(`${appt.appointmentDate}T${appt.appointmentTime}`, 'yyyy-MM-dd\'T\'HH:mm', new Date()),
    }))
    .filter(appt => {
      const now = new Date();
      return appt.dateTime >= now;
    })
    .sort((a, b) => compareAsc(a.dateTime, b.dateTime));

  // Group appointments by date
  const groupedAppointments = futureAppointments.reduce((acc, appt) => {
    const dateKey = appt.appointmentDate;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(appt);
    return acc;
  }, {} as Record<string, (Appointment & { dateTime: Date })[]>);
  
  const nextAppointmentDate = Object.keys(groupedAppointments)[0];
  const upcoming = nextAppointmentDate ? groupedAppointments[nextAppointmentDate] : [];

  if (upcoming.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No upcoming appointments scheduled.</p>;
  }
  
  const displayDate = parse(upcoming[0].appointmentDate, 'yyyy-MM-dd', new Date());

  return (
    <div className="space-y-4">
       <div className="text-sm font-medium text-center text-muted-foreground">
        Next appointments on {format(displayDate, 'EEEE, MMMM d')}
      </div>
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
