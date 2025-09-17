'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAiSymptomSuggestion, logStudentVisit } from '@/app/(app)/dashboard/actions';
import { logVisitSchema } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2 } from 'lucide-react';

type VisitFormValues = z.infer<typeof logVisitSchema>;

export function VisitLogForm() {
  const [isPending, startTransition] = useTransition();
  const [isSuggestionLoading, setSuggestionLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const { toast } = useToast();

  const form = useForm<VisitFormValues>({
    resolver: zodResolver(logVisitSchema),
    defaultValues: {
      studentName: '',
      studentId: '',
      symptoms: '',
      reason: '',
    },
  });

  const symptomsValue = form.watch('symptoms');

  useEffect(() => {
    if (symptomsValue.trim().length < 15) {
      setAiSuggestion('');
      return;
    }

    const handler = setTimeout(() => {
      setSuggestionLoading(true);
      startTransition(async () => {
        const result = await getAiSymptomSuggestion({ symptoms: symptomsValue });
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
  }, [symptomsValue]);

  function onSubmit(data: VisitFormValues) {
    startTransition(async () => {
      const result = await logStudentVisit(data);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        form.reset();
        setAiSuggestion('');
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
    <Card>
      <CardHeader>
        <CardTitle>New Visit</CardTitle>
        <CardDescription>Fill in the details for a new student visit.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} />
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
                    <Input placeholder="e.g. S123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
      </CardContent>
    </Card>
  );
}
