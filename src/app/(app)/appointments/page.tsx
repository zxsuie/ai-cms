
'use client';

import { AppointmentCalendar } from "@/components/appointments/appointment-calendar";
import { UpcomingAppointments } from "@/components/appointments/upcoming-appointments";
import { ScheduleAppointmentForm } from "@/components/appointments/schedule-appointment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { PastAppointments } from "@/components/appointments/past-appointments";

function AdminAppointmentView() {
  return (
     <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Next scheduled appointments for all users.</CardDescription>
                </CardHeader>
                <CardContent>
                <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                    <UpcomingAppointments />
                </Suspense>
                </CardContent>
            </Card>
            </div>
            <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>All Past Appointments</CardTitle>
                    <CardDescription>A record of all completed appointments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                        <PastAppointments />
                    </Suspense>
                </CardContent>
            </Card>
            </div>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Book Appointment for User</CardTitle>
                <CardDescription>Admins can schedule appointments on behalf of any user.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScheduleAppointmentForm />
            </CardContent>
        </Card>
     </>
  );
}

function UserAppointmentView() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>Book an Appointment</CardTitle>
                <CardDescription>Select a date and time to schedule your visit to the clinic.</CardDescription>
                </CardHeader>
                <CardContent>
                <ScheduleAppointmentForm />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Upcoming Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                            <UpcomingAppointments />
                        </Suspense>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Past Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                            <PastAppointments />
                        </Suspense>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


export default function AppointmentsPage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
        <div className="space-y-6">
             <Skeleton className="h-10 w-1/3" />
             <Skeleton className="h-8 w-2/3" />
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-96 lg:col-span-2" />
                <Skeleton className="h-96 lg:col-span-1" />
             </div>
        </div>
    )
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Appointment Scheduling</h1>
        <p className="text-muted-foreground">
          {isAdmin ? "Manage all student appointments." : "Schedule and manage your appointments."}
        </p>
      </div>
      
      <div className="space-y-6">
        {isAdmin ? <AdminAppointmentView /> : <UserAppointmentView />}
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
