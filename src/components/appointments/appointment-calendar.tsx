
'use client';

import {Calendar} from '@/components/ui/calendar';
import {useState, useMemo, useEffect} from 'react';
import {useAppointments} from '@/hooks/use-appointments';
import {isSameDay} from 'date-fns';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {ScrollArea} from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

export function AppointmentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const {appointments, loading} = useAppointments();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize date on the client to avoid hydration mismatch
    if (!selectedDate) {
        setSelectedDate(new Date());
    }
  }, [selectedDate]);


  const appointmentDates = useMemo(() => {
    return appointments.map(appt => new Date(appt.dateTime));
  }, [appointments]);

  const appointmentsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return appointments
      .filter(appt => isSameDay(new Date(appt.dateTime), selectedDate))
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [selectedDate, appointments]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex justify-center">
        {!isClient ? <Skeleton className="h-[300px] w-[280px]" /> :
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            initialFocus
            modifiers={{hasAppointment: appointmentDates}}
            modifiersStyles={{
              hasAppointment: {
                position: 'relative',
              },
            }}
            components={{
              DayContent: props => {
                const {date, activeModifiers} = props;
                const hasAppointment = activeModifiers.hasAppointment;
                return (
                  <>
                    <div>{date.getDate()}</div>
                    {hasAppointment && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary"></div>
                    )}
                  </>
                );
              },
            }}
          />
        }
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              Appointments for{' '}
              {selectedDate && isClient
                ? selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })
                : '...'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : appointmentsForSelectedDay.length > 0 ? (
                <div className="space-y-4">
                  {appointmentsForSelectedDay.map(appt => (
                    <div key={appt.id} className="p-3 bg-secondary rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{appt.studentName}</p>
                          <p className="text-sm text-muted-foreground">{appt.studentYear} - {appt.studentSection}</p>
                          <p className="text-sm text-muted-foreground mt-1">{appt.reason}</p>
                        </div>
                        <Badge variant="outline">
                          {new Date(appt.dateTime).toLocaleTimeString('en-US', {
                            timeZone: 'Asia/Manila',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No appointments scheduled for this day.
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
