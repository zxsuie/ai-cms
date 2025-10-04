
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  function handleSignIn() {
    router.push('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <LogIn className="h-6 w-6 text-primary" />
            <span>Secure Login</span>
          </CardTitle>
          <CardDescription>
            Click the button to access the clinical system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} className="w-full">
            Proceed to Dashboard
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
