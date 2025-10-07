
'use client'

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateReportAction } from "@/app/(app)/reports/actions";
import { GenerateAiReportOutput } from "@/ai/flows/ai-report-generator";
import { ReportDisplay } from "./report-display";
import { Loader2, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";

type ReportType = 'weekly' | 'monthly';

export function ReportGenerator() {
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<GenerateAiReportOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeReportType, setActiveReportType] = useState<ReportType | null>(null);
  const { user } = useUser();
  const { toast } = useToast();

  const handleGenerateReport = (reportType: ReportType) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to generate a report.',
        });
        return;
    }

    startTransition(async () => {
        setReport(null);
        setError(null);
        setActiveReportType(reportType);

        const result = await generateReportAction(reportType, user.fullName || user.email!);
        if (result.success) {
            setReport(result.report!);
        } else {
            setError(result.error || "An unknown error occurred.");
        }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
                onClick={() => handleGenerateReport('weekly')} 
                disabled={isPending}
                className="flex-1"
            >
              {isPending && activeReportType === 'weekly' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Weekly Report
            </Button>
            <Button 
                onClick={() => handleGenerateReport('monthly')} 
                disabled={isPending}
                className="flex-1"
                variant="secondary"
            >
              {isPending && activeReportType === 'monthly' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Monthly Report
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isPending && (
         <div className="flex items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="mr-4 h-8 w-8 animate-spin text-primary" />
            <p className="font-headline text-lg">Generating AI report, please wait...</p>
         </div>
      )}

      {error && (
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Report Generation Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {report && <ReportDisplay report={report} type={activeReportType!} />}
    </div>
  );
}
