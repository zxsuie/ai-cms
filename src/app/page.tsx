
'use client';

import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


export default function Home() {
  const { user, isAdmin, loading, isLoggedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push('/agreement');
      } else if (isAdmin) {
        router.push('/dashboard');
      } else {
        // For non-admins, the main page is now the appointments page
        router.push('/appointments');
      }
    }
  }, [user, isAdmin, loading, router, isLoggedIn]);

  // Show a loading skeleton while we determine where to redirect the user
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
