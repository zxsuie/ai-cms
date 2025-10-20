
import { MainSidebar } from '@/components/layout/main-sidebar';
import { Header } from '@/components/layout/header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { InactivityLogoutProvider } from '@/components/auth/inactivity-logout-provider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <InactivityLogoutProvider>
        <MainSidebar />
        <SidebarInset>
            <div className="flex flex-col h-full">
                <Header />
                <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </SidebarInset>
      </InactivityLogoutProvider>
    </SidebarProvider>
  );
}

    