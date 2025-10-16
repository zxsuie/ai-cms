
'use client';

import { useUser } from '@/hooks/use-user';
import { useInactivityLogout } from '@/hooks/use-inactivity-logout';

// Durations in minutes
const TIMEOUT_DURATIONS = {
  super_admin: 15,
  admin: 8,
  student: 3,
  employee: 3,
  staff: 3,
};

export function InactivityLogoutProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useUser();
  const role = user?.role || 'student'; // Default to shortest duration if role is somehow missing
  
  // Convert minutes to milliseconds
  const timeoutDuration = (TIMEOUT_DURATIONS[role] || 3) * 60 * 1000;

  // The hook is only active when the user is logged in.
  useInactivityLogout(isLoggedIn ? timeoutDuration : null);

  return <>{children}</>;
}
