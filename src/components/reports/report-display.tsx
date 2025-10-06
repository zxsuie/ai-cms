import { GenerateAiReportOutput } from "@/ai/flows/ai-report-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Pill, Activity, Syringe, ListChecks } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface ReportDisplayProps {
  report: GenerateAiReportOutput;
  type: 'weekly' | 'monthly' | null;
}

export function ReportDisplay({ report, type }: ReportDisplayProps) {
  if (!type) {
    return null;
  }
  
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
            <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-headline text-lg">Visit Summary</CardTitle>
            <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Activity className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
             <div className="text-4xl font-bold">{report.totalVisits}</div>
            <p className="text-muted-foreground mt-2">{report.summaryText}</p>
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
              <p className="text-muted-foreground">{report.medicinesDispensed}</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
