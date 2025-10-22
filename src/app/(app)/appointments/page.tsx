
'use client';

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleAppointmentForm } from "@/components/appointments/schedule-appointment-form";
import { UpcomingAppointments } from "@/components/appointments/upcoming-appointments";
import { PastAppointments } from "@/components/appointments/past-appointments";
import { AppointmentDataTable } from "@/components/appointments/appointment-data-table";

function AdminAppointmentView() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Appointment Management</h1>
                <p className="text-muted-foreground">
                View, filter, and manage all scheduled appointments.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Appointments</CardTitle>
                    <CardDescription>A complete log of all upcoming and past appointments across the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                        <AppointmentDataTable />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

function UserAppointmentView() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-6">
             <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Your Appointments</h1>
                <p className="text-muted-foreground">Schedule and manage your appointments with the clinic.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                        <CardTitle>Book an Appointment</CardTitle>
                        <CardDescription>Select a date and time to schedule your visit to the clinic.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <ScheduleAppointmentForm />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
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
        </div>
    );
}


export default function AppointmentsPage() {
  const { isAdmin, loading } = useUser();

  if (loading) {
    return (
        <div className="space-y-6">
             <Skeleton className="h-10 w-1/3" />
             <Skeleton className="h-8 w-2/3" />
             <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  return isAdmin ? <AdminAppointmentView /> : <UserAppointmentView />;
}
