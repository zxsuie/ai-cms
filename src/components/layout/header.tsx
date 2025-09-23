'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';

export function Header() {
  const pathname = usePathname();
    const { state } = useSidebar();
  const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/inventory': 'Medicine Inventory',
    '/reports': 'AI Reports',
    '/appointments': 'Appointment Scheduling',
  };
  const title = pageTitles[pathname] ?? 'ClinicFlow';
  
  return (
    <header className="flex h-16 items-center border-b bg-card px-4 shrink-0 sm:px-6">
        <div className="mr-4 md:hidden">
            <SidebarTrigger />
        </div>
        <div className="hidden md:block mr-4">
            <SidebarTrigger />
        </div>
      <div className="flex-1">
        <h1 className="text-xl font-headline font-semibold">{title}</h1>
      </div>
    </header>
  );
}
