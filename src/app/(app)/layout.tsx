
'use client';

import { MainSidebar } from '@/components/layout/main-sidebar';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { InactivityLogoutProvider } from '@/components/auth/inactivity-logout-provider';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isHovering } = useSidebar();
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
