
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardGreeting() {
  const { user, loading } = useUser();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  if (loading) {
    return (
        <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
        </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-headline font-bold tracking-tight">
        {greeting}, {user?.fullName || user?.email}!
      </h1>
      <p className="text-muted-foreground">
        Here's an overview of the clinic's activities and key metrics.
      </p>
    </div>
  );
}
