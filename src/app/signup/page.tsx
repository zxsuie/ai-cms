'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [role, setRole] = useState<'student' | 'employee' | 'staff' | ''>('');

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
                    </CardTitle>
                    <CardDescription>
                        Enter your details to create a new account.
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

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select name="role" required onValueChange={(value) => setRole(value as any)}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="employee">Employee</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {role === 'student' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="course">Course</Label>
                                <Input id="course" name="course" placeholder="e.g. BS in Computer Science" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="studentSection">Section</Label>
                                <Input id="studentSection" name="studentSection" placeholder="e.g. BSCS-2A" required />
                            </div>
                        </>
                    )}

                    {(role === 'employee' || role === 'staff') && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input id="department" name="department" placeholder="e.g. College of Engineering" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jobTitle">Job Title</Label>
                                <Input id="jobTitle" name="jobTitle" placeholder="e.g. Professor" required />
                            </div>
                        </>
                    )}


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
