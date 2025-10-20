
'use client';

import { NotificationBell } from './notification-bell';
import { UserProfileButton } from './user-profile-button';

export function Header() {
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <NotificationBell />
            <UserProfileButton />
        </header>
    );
}
