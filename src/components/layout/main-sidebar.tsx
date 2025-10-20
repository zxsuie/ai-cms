
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
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Boxes, BarChart3, CalendarDays, ScrollText, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { Skeleton } from '../ui/skeleton';
import { LogVisitButton } from '../dashboard/log-visit-button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';


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
  const { user, loading, isSuperAdmin, isAdmin } = useUser();

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
            {allMenuItems.map((item) => (
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
          </SidebarFooter>
      </Sidebar>
    );
  }

  const userRole = user?.role || '';
  const menuItems = allMenuItems.filter(item => {
    if (!item.roles.includes(userRole)) return false;
    if (item.href === '/appointments') {
        return true;
    }
    return true;
  });


  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 p-2 group-data-[state=expanded]:p-4 group-data-[state=expanded]:pl-2 transition-all justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-8 h-8 text-sidebar-primary shrink-0">
            <path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 60a12 12 0 1 1-12 12a12 12 0 0 1 12-12m60 92h-52v52a12 12 0 0 1-24 0v-52H56a12 12 0 0 1 0-24h52V92a12 12 0 0 1 24 0v52h52a12 12 0 0 1 0 24"/>
          </svg>
          <h2 className="text-2xl font-headline font-semibold text-sidebar-foreground group-data-[state=collapsed]:hidden">
            iClinicMate
          </h2>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2 group-data-[state=collapsed]:p-1.5 transition-all">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href} className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center">
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
         {isSuperAdmin && (
             <SidebarGroup className="mt-4 pt-4 border-t border-sidebar-border">
                 {superAdminItems.map((item) => (
                    <SidebarMenuItem key={item.href} className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center">
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
      <SidebarFooter className="border-t border-sidebar-border p-2">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start h-auto p-2 group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:w-10 group-data-[state=collapsed]:h-10">
                    <div className="flex items-center justify-start gap-3 w-full group-data-[state=collapsed]:justify-center">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.avatarUrl || `https://i.pravatar.cc/150?u=${user?.id}`} alt={user?.fullName || 'User'} />
                            <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="group-data-[state=collapsed]:hidden text-left">
                            <p className="font-semibold text-sm text-sidebar-foreground truncate">{user?.fullName || user?.email}</p>
                            <p className="text-xs text-sidebar-foreground/70 capitalize">{user?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
         <div className="flex justify-center py-2">
            <SidebarTrigger />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
