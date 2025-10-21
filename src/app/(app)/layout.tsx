
'use client';

import { MainSidebar } from '@/components/layout/main-sidebar';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { InactivityLogoutProvider } from '@/components/auth/inactivity-logout-provider';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isHovering } = useSidebar();
  const { isAdmin } = useUser();

  // Admin users (and super_admins) see the dashboard, which already has the correct layout structure.
  // This specifically targets non-admin users to fix their content alignment.
  if (!isAdmin) {
    return (
      <div className="flex">
        <MainSidebar />
        <div
          className={cn(
            'flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen',
            'md:ml-[80px]',
            isHovering && 'md:ml-[240px]'
          )}
        >
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // This is the original structure, primarily for admin views like the main dashboard.
  return (
    <div className="flex">
      <MainSidebar />
       <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen',
          'md:ml-[80px]',
          isHovering && 'md:ml-[240px]'
        )}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <InactivityLogoutProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
      </InactivityLogoutProvider>
    </SidebarProvider>
  );
}
