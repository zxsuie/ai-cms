
'use client';

import { useState, useTransition } from 'react';
import { GenerateAiReportOutput } from "@/ai/flows/ai-report-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Pill, Activity, ListChecks, Loader2, CalendarClock } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Markdown } from "../ui/markdown";
import { useToast } from '@/hooks/use-toast';
import { generatePdfReport } from '@/lib/generate-pdf-report';
import { getReportDataForPdf } from '@/app/(app)/reports/actions';
import type { StudentVisit, Appointment, ActivityLog } from '@/lib/types';


interface ReportDisplayProps {
  report: GenerateAiReportOutput;
  type: 'weekly' | 'monthly' | null;
}

export function ReportDisplay({ report, type }: ReportDisplayProps) {
  const [isExporting, startExportTransition] = useTransition();
  const { toast } = useToast();

  if (!type) {
    return null;
  }
  
  const handleExport = () => {
    startExportTransition(async () => {
      try {
        // Fetch all data required for the detailed report
        const result = await getReportDataForPdf();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch data for PDF report.');
        }

        const { visits, appointments, logs } = result;

        await generatePdfReport({
          aiReport: report,
          reportType: type,
          visits: visits as StudentVisit[],
          appointments: appointments as Appointment[],
          logs: logs as ActivityLog[]
        });
        
        toast({
          title: "✅ Success",
          description: "Detailed Report successfully exported as PDF!",
        });

      } catch (error) {
        console.error("PDF Export failed:", error);
        toast({
          variant: "destructive",
          title: "❌ Export Failed",
          description: "Could not generate the PDF report.",
        });
      }
    });
  };
  
  return (
    <Card className="animate-in fade-in-50 duration-500">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-2xl">
                    {type.charAt(0).toUpperCase() + type.slice(1)} Clinic Report
                </CardTitle>
                <CardDescription>
                    AI-generated summary of clinic activity.
                </CardDescription>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <FileText className="mr-2 h-4 w-4" />
                )}
                Export as PDF
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-headline text-lg">Total Visits</CardTitle>
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Activity className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                 <div className="text-4xl font-bold">{report.totalVisits}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-headline text-lg">Total Appointments</CardTitle>
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <CalendarClock className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                 <div className="text-4xl font-bold">{report.totalAppointments}</div>
              </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader>
             <CardTitle className="font-headline text-lg">Overall Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
                <Markdown text={report.summaryText} />
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-headline text-lg">Most Common Symptoms</CardTitle>
              <div className="p-3 rounded-full bg-accent/10 text-accent">
                <ListChecks className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 pt-2">
                {report.mostCommonSymptoms.map((symptom, index) => (
                    <Badge key={index} variant="secondary" className="text-base font-normal">
                        {symptom}
                    </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-headline text-lg">Medicines Dispensed</CardTitle>
               <div className="p-3 rounded-full bg-destructive/10 text-destructive">
                <Pill className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <Markdown text={report.medicinesDispensed} />
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
