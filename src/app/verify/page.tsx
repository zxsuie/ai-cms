
import { Suspense } from 'react';
import { VerificationForm } from '@/components/auth/verification-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function VerifyPageContent() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline text-center">Check your email</CardTitle>
                    <CardDescription className="text-center">
                        We've sent a 6-digit verification code to your email address.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <VerificationForm />
                </CardContent>
            </Card>
        </main>
    )
}

function LoadingFallback() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background p-4">
             <Card className="w-full max-w-md">
                <CardHeader>
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center gap-2">
                        <Skeleton className="h-14 w-10" />
                        <Skeleton className="h-14 w-10" />
                        <Skeleton className="h-14 w-10" />
                        <Skeleton className="h-14 w-10" />
                        <Skeleton className="h-14 w-10" />
                        <Skeleton className="h-14 w-10" />
                    </div>
                    <Skeleton className="h-10 w-full mt-6" />
                    <Skeleton className="h-4 w-32 mx-auto mt-4" />
                </CardContent>
            </Card>
        </main>
    )
}


export default function VerifyPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <VerifyPageContent />
        </Suspense>
    )
}
