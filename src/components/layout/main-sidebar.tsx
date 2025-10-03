'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { PlusCircle, LayoutDashboard, Boxes, BarChart3, CalendarDays, ScrollText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/logs', label: 'Logs', icon: ScrollText },
];

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 p-2">
          <PlusCircle className="w-8 h-8 text-sidebar-primary" />
          <h2 className="text-2xl font-headline font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Project Name
          </h2>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
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
      </SidebarMenu>
      <SidebarFooter className="border-t border-sidebar-border p-2">
         <div className="flex items-center gap-3 p-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://picsum.photos/seed/nurse/100/100" alt="Nurse" data-ai-hint="nurse portrait" />
            <AvatarFallback>N</AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-semibold text-sm text-sidebar-foreground">Nurse Manuel</p>
            <p className="text-xs text-sidebar-foreground/70">Administrator</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
