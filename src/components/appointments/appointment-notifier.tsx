
'use client';

import { useEffect, useState } from 'react';
import { useAppointments } from '@/hooks/use-appointments';
import { useToast } from '@/hooks/use-toast';
import { differenceInMinutes } from 'date-fns';

const NOTIFICATION_WINDOW_MINUTES = 5; // Notify if appointment is within 5 minutes
const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

export function AppointmentNotifier() {
  const { appointments } = useAppointments();
  const { toast } = useToast();
  const [notifiedAppointmentIds, setNotifiedAppointmentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkAppointments = () => {
      const now = new Date();
      
      appointments.forEach(appt => {
        const appointmentTime = new Date(appt.dateTime);
        const minutesUntil = differenceInMinutes(appointmentTime, now);

        // Check if the appointment is coming up and hasn't been notified yet
        if (
          minutesUntil >= 0 &&
          minutesUntil <= NOTIFICATION_WINDOW_MINUTES &&
          !notifiedAppointmentIds.has(appt.id)
        ) {
          toast({
            title: 'Appointment Reminder',
            description: `Appointment for ${appt.studentName} is starting now.`,
          });
          
          // Add to notified list to prevent spamming
          setNotifiedAppointmentIds(prev => new Set(prev).add(appt.id));
        }
      });
    };

    // Check immediately on load and then set an interval
    checkAppointments();
    const intervalId = setInterval(checkAppointments, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [appointments, toast, notifiedAppointmentIds]);

  return null; // This component does not render anything
}

