
import { MainSidebar } from '@/components/layout/main-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { InactivityLogoutProvider } from '@/components/auth/inactivity-logout-provider';
import { NotificationBell } from '@/components/layout/notification-bell';
import { UserProfileButton } from '@/components/layout/user-profile-button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <InactivityLogoutProvider>
        <div className="flex">
          <MainSidebar />
          <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out md:ml-[80px] group-hover:md:ml-[240px]">
              <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
                  {children}
              </main>
          </div>
        </div>
        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4">
            <NotificationBell />
            <UserProfileButton />
        </div>
      </InactivityLogoutProvider>
    </SidebarProvider>
  );
}
