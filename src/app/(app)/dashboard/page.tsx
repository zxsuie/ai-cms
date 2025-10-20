
import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCards } from '@/components/dashboard/stat-cards';
import { VisitTrendsChart } from '@/components/dashboard/visit-trends-chart';
import { UpcomingAppointments } from '@/components/appointments/upcoming-appointments';
import { SymptomDistributionChart } from '@/components/dashboard/symptom-distribution-chart';
import { VisitsDataTable } from '@/components/dashboard/visits-data-table';
import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <DashboardGreeting />
      </div>
      
      {/* Stat Cards */}
      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      }>
        <StatCards />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Visit Trends</CardTitle>
                    <CardDescription>Number of student visits over the past 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                        <VisitTrendsChart />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Common Symptoms</CardTitle>
                    <CardDescription>Distribution of symptoms from recent visits.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                        <SymptomDistributionChart />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
           <Card>
            <CardHeader>
              <CardTitle>All Clinic Visits</CardTitle>
              <CardDescription>A complete log of all visits to the clinic by students, employees, and staff.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <VisitsDataTable />
              </Suspense>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
            <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
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

    </div>
  );
}
