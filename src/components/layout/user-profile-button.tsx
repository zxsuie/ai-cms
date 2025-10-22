
'use client';

import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { LogOut, User as UserIcon, Monitor, Moon, Sun } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';

export function UserProfileButton() {
    const { user, loading } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const { setTheme } = useTheme();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        router.push('/login');
        router.refresh();
    };

    if (loading) {
        return <Skeleton className="h-9 w-48" />;
    }
    
    const getRoleDetails = () => {
        if (!user) return '';
        switch(user.role) {
            case 'student':
                return `${user.role.replace('_', ' ')} - ${user.studentSection}`;
            case 'employee':
            case 'staff':
                 return user.jobTitle || user.role.replace('_', ' ');
            default:
                 return user.role.replace('_', ' ');
        }
    }


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 gap-2 px-2">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.avatarUrl || `https://i.pravatar.cc/150?u=${user?.id}`} alt={user?.fullName || 'User'} />
                        <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                     <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-medium">{user?.fullName || user?.email}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                           {getRoleDetails()}
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal sm:hidden">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.fullName || user?.email}</p>
                        <p className="text-xs leading-none text-muted-foreground capitalize">
                        {getRoleDetails()}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="sm:hidden" />
                <DropdownMenuItem disabled>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span>Theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Light</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon className="mr-2 h-4 w-4" />
                            <span>Dark</span>
                        </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
