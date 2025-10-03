
'use client';

import { useState, useEffect } from 'react';
import { useAppointments } from '@/hooks/use-appointments';
import { differenceInMinutes } from 'date-fns';
import { Bell, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

const NOTIFICATION_WINDOW_MINUTES = 15; // Show appointments within the next 15 minutes

export function NotificationBell() {
  const { appointments } = useAppointments();
  const [upcomingAppointments, setUpcomingAppointments] = useState<typeof appointments>([]);

  useEffect(() => {
    const checkAppointments = () => {
      const now = new Date();
      const upcoming = appointments.filter(appt => {
        const appointmentTime = new Date(appt.dateTime);
        const minutesUntil = differenceInMinutes(appointmentTime, now);
        return minutesUntil >= 0 && minutesUntil <= NOTIFICATION_WINDOW_MINUTES;
      });
      setUpcomingAppointments(upcoming);
    };

    checkAppointments();
    const intervalId = setInterval(checkAppointments, 60 * 1000); // Check every minute

    return () => clearInterval(intervalId);
  }, [appointments]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {upcomingAppointments.length > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none">Reminders</h4>
            <p className="text-sm text-muted-foreground">
              Appointments starting soon.
            </p>
          </div>
          <Separator />
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map(appt => (
                <div key={appt.id} className="flex items-start gap-3">
                  <div className="pt-1">
                    <CalendarCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{appt.studentName}</p>
                    <p className="text-xs text-muted-foreground">{appt.reason}</p>
                     <p className="text-xs text-muted-foreground mt-1">
                        {new Date(appt.dateTime).toLocaleTimeString('en-US', {
                            timeZone: 'Asia/Manila',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              No upcoming appointments right now.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
