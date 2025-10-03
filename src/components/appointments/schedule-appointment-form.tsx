
'use client';

import { useTransition, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { format, addMinutes, subMinutes } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { scheduleAppointment } from '@/app/(app)/appointments/actions';
import { scheduleAppointmentSchema, type Appointment } from '@/lib/types';
import { useAppointments } from '@/hooks/use-appointments';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

// Wrapper to ensure Calendar only renders on the client
function ClientCalendar({
  selected,
  onSelect,
  ...props
}: React.ComponentProps<typeof Calendar>) {
    return (
        <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={(date: Date) =>
            date < new Date(new Date().setHours(0, 0, 0, 0)) ||
            date.getDay() === 0 || 
            date.getDay() === 6
        }
        initialFocus
        {...props}
        />
    );
}

type AppointmentFormValues = z.infer<typeof scheduleAppointmentSchema>;

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00',
  '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
];
const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export function ScheduleAppointmentForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { appointments } = useAppointments();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(scheduleAppointmentSchema),
    defaultValues: {
      studentName: '',
      studentId: '',
      studentYear: '',
      studentSection: '',
      reason: '',
      // Do not set a default `new Date()` here to avoid hydration mismatch
      time: '',
    },
  });

  const selectedDate = form.watch('date');

  const isTimeSlotBooked = (time: string, date: Date, existingAppointments: Appointment[]): boolean => {
    if (!date) return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    // Create a new date object representing the chosen slot in the local timezone of the browser.
    // This matches the logic on the server which now uses fromZonedTime.
    const checkTime = new Date(date);
    checkTime.setHours(hours, minutes, 0, 0);

    const thirtyMinutesBefore = subMinutes(checkTime, 29);
    const thirtyMinutesAfter = addMinutes(checkTime, 29);

    return existingAppointments.some(appt => {
        // The DB returns a UTC timestamp string. new Date() correctly parses this into a Date object.
        const apptTime = new Date(appt.dateTime);
        // This comparison works because both are Date objects representing specific moments in time.
        return apptTime > thirtyMinutesBefore && apptTime < thirtyMinutesAfter;
    });
  }

  function onSubmit(data: AppointmentFormValues) {
    if (!data.date) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please select a date for the appointment.',
        });
        return;
    }
    startTransition(async () => {
      // The server action now expects `date` to be a Date object.
      const result = await scheduleAppointment(data);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        form.reset({
          studentName: '',
          studentId: '',
          studentYear: '',
          studentSection: '',
          reason: '',
          date: undefined,
          time: '',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="studentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Jane Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student ID</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. S98765" {...field} maxLength={8} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="studentYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {yearLevels.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentSection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. BSCS-2A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Appointment</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. Follow-up check, immunization shot..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!isClient ? (
            <>
              <div className='space-y-2'>
                <Label>Date</Label>
                <Skeleton className="h-10 w-full" />
              </div>
              <div className='space-y-2'>
                <Label>Time</Label>
                <Skeleton className="h-10 w-full" />
              </div>
            </>
          ) : (
            <>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <ClientCalendar
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date);
                              form.setValue('time', ''); // Reset time when date changes
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDate}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={!selectedDate ? "Select a date first" : "Select a time slot"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((slot) => {
                          const isBooked = selectedDate ? isTimeSlotBooked(slot, selectedDate, appointments) : false;
                          return (
                          <SelectItem key={slot} value={slot} disabled={isBooked}>
                            <span className={cn(isBooked && "line-through text-muted-foreground")}>
                              {new Date(`1970-01-01T${slot}:00`).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </span>
                            {isBooked && <span className="text-xs text-muted-foreground ml-2">(Booked)</span>}
                          </SelectItem>
                        )})}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <Button type="submit" disabled={isPending} className="w-full md:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Schedule Appointment
        </Button>
      </form>
    </Form>
  );
}
