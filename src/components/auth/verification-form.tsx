
'use client';

import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { verifyOtp, resendOtp } from '@/app/verify/actions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const otpSchema = z.object({
  pin: z.string().min(6, { message: 'Your one-time password must be 6 characters.' }),
});

export function VerificationForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { toast } = useToast();
  const [isResendPending, startResendTransition] = useTransition();

  const [resendCooldown, setResendCooldown] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const [state, formAction, isVerifyPending] = useActionState(verifyOtp, undefined);

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { pin: '' },
  });

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: state.error,
      });
      form.reset();
      inputsRef.current[0]?.focus();
    }
  }, [state, toast, form]);

  useEffect(() => {
    if (resendCooldown > 0) {
      intervalRef.current = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [resendCooldown]);

  const handleResend = () => {
    if (resendCooldown > 0) return;
    startResendTransition(async () => {
      const result = await resendOtp(email);
      if (result?.success) {
        toast({ title: 'Code Sent', description: 'A new verification code has been sent to your email.' });
        setResendCooldown(60); // Start 60-second cooldown
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result?.error });
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    const currentPin = [...(form.getValues('pin') || '')];
    currentPin[index] = value.slice(-1);
    form.setValue('pin', currentPin.join(''));

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    form.setValue('pin', pastedData);
    pastedData.split('').forEach((char, index) => {
        if(inputsRef.current[index]) {
            (inputsRef.current[index] as HTMLInputElement).value = char;
        }
    });
    inputsRef.current[pastedData.length -1]?.focus();
  };

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="email" value={email} />
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">One-Time Password</FormLabel>
              <FormControl>
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputsRef.current[index] = el)}
                      {...field}
                      name={`pin-${index}`}
                      value={field.value?.[index] || ''}
                      onChange={(e) => handleInputChange(e, index)}
                      maxLength={1}
                      className="h-14 w-10 text-center text-lg font-mono"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage className="text-center" />
            </FormItem>
          )}
        />

        {state?.error && (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isVerifyPending}>
          {isVerifyPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <p className="text-muted-foreground">Didn't receive the code?</p>
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResendPending}
        >
          {isResendPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            `Resend code ${resendCooldown > 0 ? `in ${resendCooldown}s` : ''}`
          )}
        </Button>
      </div>
    </Form>
  );
}
