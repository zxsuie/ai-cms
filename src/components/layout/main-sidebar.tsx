
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Boxes, BarChart3, CalendarDays, ScrollText, LogOut, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { Skeleton } from '../ui/skeleton';
import { LogVisitButton } from '../dashboard/log-visit-button';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/logs', label: 'Logs', icon: ScrollText },
];

const superAdminItems = [
    { href: '/security', label: 'Security', icon: ShieldCheck },
]

export function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useUser();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
    router.refresh();
  };
  
  if (loading) {
    return (
      <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
              <Skeleton className="w-32 h-8" />
          </SidebarHeader>
          <SidebarMenu className="flex-1 p-2">
            {menuItems.map((item) => (
                <Skeleton key={item.href} className="w-full h-10 mb-2" />
            ))}
          </SidebarMenu>
          <SidebarFooter className="border-t border-sidebar-border p-2 space-y-2">
            <div className="flex items-center gap-3 p-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="group-data-[collapsible=icon]:hidden space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <Skeleton className="w-full h-9" />
          </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 p-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-8 h-8 text-sidebar-primary">
            <path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 60a12 12 0 1 1-12 12a12 12 0 0 1 12-12m60 92h-52v52a12 12 0 0 1-24 0v-52H56a12 12 0 0 1 0-24h52V92a12 12 0 0 1 24 0v52h52a12 12 0 0 1 0 24"/>
          </svg>
          <h2 className="text-2xl font-headline font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            iClinicMate
          </h2>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
            <LogVisitButton />
        </div>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={{ children: item.label, side: 'right' }}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
         {user?.role === 'super_admin' && (
             <SidebarGroup className="mt-4 pt-4 border-t border-sidebar-border">
                <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
                 {superAdminItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={{ children: item.label, side: 'right' }}
                        >
                        <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarGroup>
         )}
      </SidebarMenu>
      <SidebarFooter className="border-t border-sidebar-border p-2 space-y-2">
         <div className="flex items-center gap-3 p-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatarUrl || `https://i.pravatar.cc/150?u=${user?.id}`} alt={user?.fullName || 'User'} />
            <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-semibold text-sm text-sidebar-foreground">{user?.fullName || user?.email}</p>
            <p className="text-xs text-sidebar-foreground/70 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
