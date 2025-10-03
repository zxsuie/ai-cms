import { AppointmentCalendar } from "@/components/appointments/appointment-calendar";
import { UpcomingAppointments } from "@/components/appointments/upcoming-appointments";
import { ScheduleAppointmentForm } from "@/components/appointments/schedule-appointment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Appointment Scheduling</h1>
        <p className="text-muted-foreground">
          Schedule and manage student appointments.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule New Appointment</CardTitle>
              <CardDescription>Fill out the form below to add a new appointment.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScheduleAppointmentForm />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
              <CardDescription>Next scheduled appointments.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <UpcomingAppointments />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>View scheduled appointments by date.</CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentCalendar />
          </CardContent>
        </Card>
    </div>
  );
}
