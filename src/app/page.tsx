
'use client';

import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// This is the new landing page for non-admin users.
import { ScheduleAppointmentForm } from "@/components/appointments/schedule-appointment-form";
import { UpcomingAppointments } from "@/components/appointments/upcoming-appointments";
import { PastAppointments } from "@/components/appointments/past-appointments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

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


export default function Home() {
  const { user, isAdmin, loading, isLoggedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push('/agreement');
      } else if (isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, isAdmin, loading, router, isLoggedIn]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="space-y-6 w-full max-w-4xl p-4">
             <Skeleton className="h-10 w-1/3" />
             <Skeleton className="h-8 w-2/3" />
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-96 lg:col-span-2" />
                <Skeleton className="h-96 lg:col-span-1" />
             </div>
        </div>
      </div>
    );
  }

  // If user is logged in but not an admin, show the user appointment view.
  if (isLoggedIn && !isAdmin) {
     return (
        <main className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
                 <div>
                    <h1 className="text-3xl font-headline font-bold tracking-tight">Your Appointments</h1>
                    <p className="text-muted-foreground">Schedule and manage your appointments with the clinic.</p>
                </div>
                <UserAppointmentView />
            </div>
        </main>
    );
  }

  // Fallback for non-logged-in users (should be redirected by middleware, but good to have)
  return null;
}
