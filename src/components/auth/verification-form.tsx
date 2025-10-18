
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
import { cn } from '@/lib/utils';

const otpSchema = z.object({
  pin: z.string().min(6, { message: 'Your one-time password must be 6 characters.' }),
});

const MAX_RESEND_ATTEMPTS = 3;
const RESEND_COOLDOWN_HOURS = 1;

export function VerificationForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { toast } = useToast();
  const [isResendPending, startResendTransition] = useTransition();

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockExpiresAt, setBlockExpiresAt] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout>();

  const [state, formAction, isVerifyPending] = useActionState(verifyOtp, undefined);

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { pin: '' },
  });

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Load state from localStorage on mount
   useEffect(() => {
    const storedAttempts = localStorage.getItem(`resendAttempts_${email}`);
    const storedBlockExpires = localStorage.getItem(`blockExpires_${email}`);

    const now = Date.now();

    if (storedBlockExpires && now < Number(storedBlockExpires)) {
      setIsBlocked(true);
      setBlockExpiresAt(Number(storedBlockExpires));
    } else {
        localStorage.removeItem(`blockExpires_${email}`);
        localStorage.removeItem(`resendAttempts_${email}`);
    }

    if (storedAttempts && !isBlocked) {
      setResendAttempts(Number(storedAttempts));
    }
  }, [email, isBlocked]);

   // Countdown timer for resend button
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

  // Countdown timer for block period
  useEffect(() => {
    if (isBlocked && blockExpiresAt) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (now > blockExpiresAt) {
          setIsBlocked(false);
          setBlockExpiresAt(null);
          setResendAttempts(0);
          localStorage.removeItem(`resendAttempts_${email}`);
          localStorage.removeItem(`blockExpires_${email}`);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isBlocked, blockExpiresAt, email]);


  // Handle verification errors
  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: state.error,
      });
      form.reset();
      inputsRef.current.forEach(input => {
        if (input) input.value = '';
      });
      inputsRef.current[0]?.focus();
    }
  }, [state, toast, form]);


  const startButtonCooldown = () => {
    setResendCooldown(60);
  }

  const handleResend = () => {
    if (resendCooldown > 0 || isResendPending || isBlocked) return;

    startResendTransition(async () => {
        const attempts = resendAttempts + 1;
        const result = await resendOtp(email);

        if (result?.success) {
            toast({ title: 'Code Sent', description: 'A new verification code has been sent.' });
            setResendAttempts(attempts);
            localStorage.setItem(`resendAttempts_${email}`, String(attempts));
            startButtonCooldown();

            if (attempts >= MAX_RESEND_ATTEMPTS) {
                const newBlockExpiresAt = Date.now() + RESEND_COOLDOWN_HOURS * 60 * 60 * 1000;
                setIsBlocked(true);
                setBlockExpiresAt(newBlockExpiresAt);
                localStorage.setItem(`blockExpires_${email}`, String(newBlockExpiresAt));
            }
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result?.error || 'Failed to resend code.' });
        }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const target = e.target;
    let { value } = target;

    if (!/^\d*$/.test(value)) return;
    
    value = value.slice(-1);
    target.value = value;
    
    // This is for visual progression, but we will construct the final pin on submit
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && index > 0) {
        inputsRef.current[index - 1]?.focus();
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    
    pastedData.split('').forEach((char, index) => {
        if(inputsRef.current[index]) {
            (inputsRef.current[index] as HTMLInputElement).value = char;
        }
    });

    const nextIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputsRef.current[nextIndex]?.focus();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const pin = inputsRef.current.map(input => input?.value || '').join('');
    
    // Manually set the pin value on the form data
    const formData = new FormData(formElement);
    formData.set('pin', pin);

    // Validate with react-hook-form before calling the server action
    form.handleSubmit(() => {
        formAction(formData);
    })(e);
  };
  
  const getBlockTimeRemaining = () => {
    if (!blockExpiresAt) return '';
    const remaining = Math.max(0, blockExpiresAt - Date.now());
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
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
                      name={`pin-${index}`}
                      onChange={(e) => handleInputChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      maxLength={1}
                      className={cn(
                        "h-14 w-10 text-center text-lg font-mono",
                         "sm:w-12 sm:h-16"
                      )}
                      autoFocus={index === 0}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage className="text-center" />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isVerifyPending}>
          {isVerifyPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        {isBlocked ? (
             <p className="text-destructive">
                Too many attempts. Please try again in {getBlockTimeRemaining()}.
            </p>
        ) : (
            <>
                <p className="text-muted-foreground">Didn't receive the code?</p>
                <Button
                variant="link"
                type="button"
                className="p-0 h-auto"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResendPending || isBlocked}
                >
                {isResendPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    `Resend code ${resendCooldown > 0 ? `in ${resendCooldown}s` : ''}`
                )}
                </Button>
                <p className="text-xs text-muted-foreground">
                    {MAX_RESEND_ATTEMPTS - resendAttempts} attempts remaining.
                </p>
            </>
        )}
      </div>
    </Form>
  );
}
