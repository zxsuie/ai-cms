
'use client';

import { useActionState, useFormStatus } from 'react';
import { authenticate, signInWithGoogle } from '@/app/login/actions';
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

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
      {pending ? 'Logging in...' : 'Login'}
    </Button>
  );
}

function GoogleButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" variant="outline" className="w-full" aria-disabled={pending}>
            {pending ? 'Redirecting...' : 'Sign In with Google'}
        </Button>
    );
}

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4">
        <Card>
          <form action={dispatch}>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">
                iClinicMate Login
              </CardTitle>
              <CardDescription>
                Enter your credentials to access the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                />
              </div>
              {errorMessage && (
                <Alert variant="destructive" className="text-xs">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <LoginButton />
            </CardFooter>
          </form>
            <CardFooter className="flex flex-col gap-4 border-t pt-4">
                <form action={signInWithGoogle}>
                    <GoogleButton />
                </form>
            </CardFooter>
        </Card>
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="underline hover:text-primary">
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
