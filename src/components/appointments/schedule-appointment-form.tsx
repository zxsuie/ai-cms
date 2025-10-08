
'use client';

import { useTransition, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { format } from 'date-fns';
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
import { Label } from '../ui/label';
import { useUser } from '@/hooks/use-user';

// Wrapper to ensure Calendar only renders on the client
function ClientCalendar({
  selected,
  onSelect,
  ...props
}: React.ComponentProps<typeof Calendar>) {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <Skeleton className="h-[280px] w-[240px]" />;
    }

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
  const { appointments } = useAppointments({ filter: 'all' }); // Fetch all for conflict checking
  const [isClient, setIsClient] = useState(false);
  const { user, loading } = useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(scheduleAppointmentSchema),
    defaultValues: {
      studentName: '',
      studentYear: '',
      studentSection: '',
      reason: '',
      date: undefined, // Initialize as undefined
      time: '',
    },
  });

  // Populate form with user data if available
  useEffect(() => {
    if (user && !loading) {
        const isAdmin = user.role === 'admin' || user.role === 'super_admin';
        if (!isAdmin) {
            form.setValue('studentName', user.fullName || '');
            // You might want to populate these from the user's profile as well
            if (user.course) form.setValue('studentYear', user.course);
            if (user.studentSection) form.setValue('studentSection', user.studentSection);
        }
    }
  }, [user, loading, form]);


  const selectedDate = form.watch('date');
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const isTimeSlotBooked = (time: string, date: Date, existingAppointments: Appointment[]): boolean => {
    if (!date) return false;
    const checkDate = format(date, 'yyyy-MM-dd');
    return existingAppointments.some(appt => appt.appointmentDate === checkDate && appt.appointmentTime === time);
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
      const result = await scheduleAppointment(data);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        // Don't reset user-populated fields for non-admins
        if(isAdmin) {
          form.reset({
            studentName: '',
            studentYear: '',
            studentSection: '',
            reason: '',
            date: undefined,
            time: '',
          });
        } else {
            form.reset({
                ...form.getValues(),
                reason: '',
                date: undefined,
                time: ''
            })
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    });
  }
  
  if (loading) {
    return <Skeleton className="h-96 w-full" />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isAdmin && (
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
                </div>
        )}
        
        {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        )}
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
