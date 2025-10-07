'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signup } from '@/app/signup/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Bot } from 'lucide-react';
import Link from 'next/link';

function SignupButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
      {pending ? 'Creating account...' : 'Create Account'}
    </Button>
  );
}

export default function SignupPage() {
  const [state, dispatch] = useActionState(signup, { message: null, success: false });

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4">
        {state.success ? (
            <Card>
                 <CardHeader>
                    <CardTitle className="text-2xl font-headline">Check your email</CardTitle>
                    <CardDescription>We've sent a verification link to your email address. Please check your inbox to complete the registration.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle>Verification Required</AlertTitle>
                        <AlertDescription>
                           You need to verify your email before you can log in.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                 <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </CardFooter>
            </Card>
        ) : (
            <Card>
                <form action={dispatch}>
                    <CardHeader>
                    <CardTitle className="text-2xl font-headline">
                        Create an Account
                    </Title>
                    <CardDescription>
                        Enter your details to create a new admin account.
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="e.g. Jane Doe"
                        required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        />
                         <p className="text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
                    </div>
                    {state.message && (
                        <Alert variant="destructive" className="text-xs">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Sign-up Failed</AlertTitle>
                        <AlertDescription>{state.message}</AlertDescription>
                        </Alert>
                    )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <SignupButton />
                    </CardFooter>
                </form>
            </Card>
        )}
         <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="underline hover:text-primary">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
