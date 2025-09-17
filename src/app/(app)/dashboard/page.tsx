import { VisitLogForm } from '@/components/dashboard/visit-log-form';
import { RecentVisits } from '@/components/dashboard/recent-visits';
import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Student Visit Logging</h1>
        <p className="text-muted-foreground">Log new student visits and view recent entries.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <VisitLogForm />
        </div>
        <div className="lg:col-span-2">
           <Card>
            <CardHeader>
              <CardTitle>Recent Visits</CardTitle>
              <CardDescription>A log of the most recent student visits to the clinic.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <RecentVisits />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
