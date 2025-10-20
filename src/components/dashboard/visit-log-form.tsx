
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { getAiSymptomSuggestion, logStudentVisit } from '@/app/(app)/dashboard/actions';
import { logVisitSchema } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useUser } from '@/hooks/use-user';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '../ui/calendar';

type VisitFormValues = z.infer<typeof logVisitSchema>;

const rolePlaceholders = {
    student: { year: 'e.g. 1st Year', section: 'e.g. BSCS-2A', yearLabel: 'Course', sectionLabel: 'Section' },
    employee: { year: 'e.g. IT Department', section: 'e.g. Developer', yearLabel: 'Department', sectionLabel: 'Job Title' },
    staff: { year: 'e.g. Maintenance', section: 'e.g. Electrician', yearLabel: 'Department', sectionLabel: 'Job Title' },
};

interface VisitLogFormProps {
  onSuccess?: () => void;
}

export function VisitLogForm({ onSuccess }: VisitLogFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSuggestionLoading, setSuggestionLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const { toast } = useToast();
  const { user } = useUser();
  const [currentTime, setCurrentTime] = useState('');

  const form = useForm<VisitFormValues>({
    resolver: zodResolver(logVisitSchema),
    defaultValues: {
      studentName: '',
      role: 'student',
      studentYear: '',
      studentSection: '',
      symptoms: '',
      reason: '',
      visitDate: new Date(),
      visitTime: '',
    },
  });

  const symptomsValue = form.watch('symptoms');
  const roleValue = form.watch('role');
  const studentYearValue = form.watch('studentYear');
  const studentSectionValue = form.watch('studentSection');

  // Set real-time clock for Manila time
  useEffect(() => {
    const timer = setInterval(() => {
      const manilaTime = formatInTimeZone(new Date(), 'Asia/Manila', 'HH:mm:ss');
      setCurrentTime(manilaTime);
      form.setValue('visitTime', manilaTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [form]);

  useEffect(() => {
    if (symptomsValue.trim().length < 15) {
      setAiSuggestion('');
      return;
    }

    const handler = setTimeout(() => {
      setSuggestionLoading(true);
      startTransition(async () => {
        const details = `${studentYearValue} - ${studentSectionValue}`;
        const result = await getAiSymptomSuggestion({ 
            symptoms: symptomsValue, 
            role: roleValue,
            details: details,
        });
        if (result.suggestions) {
          setAiSuggestion(result.suggestions);
        } else {
          setAiSuggestion('');
        }
        setSuggestionLoading(false);
      });
    }, 700);

    return () => {
      clearTimeout(handler);
    };
  }, [symptomsValue, roleValue, studentYearValue, studentSectionValue]);

  function onSubmit(data: VisitFormValues) {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to perform this action.',
        });
        return;
    }
    startTransition(async () => {
      const result = await logStudentVisit(data, user.fullName || user.email || 'Unknown User');
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        form.reset({
            studentName: '',
            role: 'student',
            studentYear: '',
            studentSection: '',
            symptoms: '',
            reason: '',
            visitDate: new Date(),
            visitTime: currentTime,
        });
        setAiSuggestion('');
        if (onSuccess) {
          onSuccess();
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

  const placeholders = rolePlaceholders[roleValue] || rolePlaceholders.student;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="studentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visitor's role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
        />

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <FormField
            control={form.control}
            name="studentYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{placeholders.yearLabel}</FormLabel>
                <FormControl>
                  <Input placeholder={placeholders.year} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentSection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{placeholders.sectionLabel}</FormLabel>
                <FormControl>
                  <Input placeholder={placeholders.section} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="visitDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Visit</FormLabel>
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
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
                control={form.control}
                name="visitTime"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Time of Visit (PH Time)</FormLabel>
                    <FormControl>
                      <Input value={currentTime} readOnly disabled />
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
              <FormLabel>Reason for Visit</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Felt dizzy in class" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="symptoms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symptoms</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the student's symptoms..." {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {(isSuggestionLoading || aiSuggestion) && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              AI Suggestion
              {isSuggestionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </AlertTitle>
            <AlertDescription>{isSuggestionLoading && !aiSuggestion ? 'Analyzing symptoms...' : aiSuggestion}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Log Visit
        </Button>
      </form>
    </Form>
  );
}
