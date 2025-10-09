
'use client';

import { Suspense } from "react";
import { AppointmentDataTable } from "@/components/appointments/appointment-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";


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

  if (!isAdmin) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Access Denied</h1>
                <p className="text-muted-foreground">
                    This page is for administrators only.
                </p>
            </div>
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Permission Required</AlertTitle>
                <AlertDescription>
                    You do not have the necessary permissions to view this page. Please contact an administrator if you believe this is an error.
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div className="space-y-6">
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
  );
}

