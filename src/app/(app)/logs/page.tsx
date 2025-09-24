import { Suspense } from 'react';
import { LogList } from '@/components/logs/log-list';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function LogsPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    actionType?: string;
  };
}) {
  const query = searchParams?.query || '';
  const actionType = searchParams?.actionType || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">
          An audit trail of all actions performed in the system.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Log Stream</CardTitle>
          <CardDescription>
            A real-time record of all system events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
            <LogList query={query} actionType={actionType} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
