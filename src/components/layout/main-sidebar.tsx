
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Boxes, BarChart3, CalendarDays, ScrollText, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';


const allMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'super_admin'] },
  { href: '/inventory', label: 'Inventory', icon: Boxes, roles: ['admin', 'super_admin'] },
  { href: '/appointments', label: 'Appointments', icon: CalendarDays, roles: ['admin', 'super_admin', 'student', 'employee', 'staff'] },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'super_admin'] },
];

const superAdminItems = [
    { href: '/logs', label: 'Logs', icon: ScrollText, roles: ['super_admin'] },
]

export function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading, isSuperAdmin } = useUser();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
    router.refresh();
  };
  
  if (loading) {
    return (
      <Sidebar>
          <SidebarHeader>
              <Skeleton className="w-10 h-10" />
          </SidebarHeader>
          <SidebarMenu className="flex-1 p-2">
            {allMenuItems.slice(0, 4).map((item) => (
                <Skeleton key={item.href} className="w-full h-10 mb-2" />
            ))}
          </SidebarMenu>
          <SidebarFooter>
            <Skeleton className="h-10 w-full" />
          </SidebarFooter>
      </Sidebar>
    );
  }

  const userRole = user?.role || '';
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));


  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center h-14 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-8 h-8 text-sidebar-primary shrink-0">
            <path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 60a12 12 0 1 1-12 12a12 12 0 0 1 12-12m60 92h-52v52a12 12 0 0 1-24 0v-52H56a12 12 0 0 1 0-24h52V92a12 12 0 0 1 24 0v52h52a12 12 0 0 1 0 24"/>
          </svg>
          <h2 className="text-2xl font-headline font-semibold text-sidebar-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2 whitespace-nowrap">
            iClinicMate
          </h2>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              className={cn(pathname === item.href && "sidebar-active-item")}
              tooltip={{ children: item.label, side: 'right' }}
            >
              <Link href={item.href}>
                <item.icon className="opacity-70 group-hover:opacity-100" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
         {isSuperAdmin && (
             <SidebarGroup className="mt-4 pt-4 border-t border-sidebar-border">
                 {superAdminItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            asChild
                            className={cn(pathname === item.href && "sidebar-active-item")}
                            tooltip={{ children: item.label, side: 'right' }}
                        >
                            <Link href={item.href}>
                                <item.icon className="opacity-70 group-hover:opacity-100" />
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarGroup>
         )}
      </SidebarMenu>
      <SidebarFooter>
        <SidebarMenuItem>
            <SidebarMenuButton 
                onClick={handleLogout}
                tooltip={{ children: 'Log Out', side: 'right' }}
            >
                <LogOut className="opacity-70 group-hover:opacity-100" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Log Out</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
