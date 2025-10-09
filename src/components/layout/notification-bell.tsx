
'use client';

import { useState, useEffect } from 'react';
import { useAppointments } from '@/hooks/use-appointments';
import { differenceInMinutes, parse, format, isToday } from 'date-fns';
import { Bell, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '../ui/skeleton';

const NOTIFICATION_WINDOW_MINUTES = 15; // Show appointments within the next 15 minutes

export function NotificationBell() {
  const { appointments } = useAppointments();
  const [upcomingAppointments, setUpcomingAppointments] = useState<typeof appointments>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures the rest of the logic only runs on the client
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) {
      return; // Don't run the interval on the server
    }

    const checkAppointments = () => {
      const now = new Date();
      const upcoming = appointments.filter(appt => {
        const apptDate = parse(appt.appointmentDate, 'yyyy-MM-dd', new Date());
        if (!isToday(apptDate)) return false;

        const [hour, minute] = appt.appointmentTime.split(':').map(Number);
        const appointmentTime = new Date();
        appointmentTime.setHours(hour, minute, 0, 0);

        const minutesUntil = differenceInMinutes(appointmentTime, now);
        return minutesUntil >= 0 && minutesUntil <= NOTIFICATION_WINDOW_MINUTES;
      });
      setUpcomingAppointments(upcoming);
    };

    checkAppointments();
    const intervalId = setInterval(checkAppointments, 60 * 1000); // Check every minute

    return () => clearInterval(intervalId);
  }, [appointments, isClient]);

  // On the server or during initial client render, show a placeholder.
  if (!isClient) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  // Once on the client, render the full component.
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
                        {format(new Date(`1970-01-01T${appt.appointmentTime}`), 'hh:mm a')}
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
