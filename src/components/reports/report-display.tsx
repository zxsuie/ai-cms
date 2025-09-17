import { GenerateAiReportOutput } from "@/ai/flows/ai-report-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Pill, Activity, Syringe } from "lucide-react";
import { Button } from "../ui/button";

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
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Activity className="h-6 w-6" />
            </div>
            <CardTitle className="font-headline text-lg">Visit Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{report.summary}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <div className="p-3 rounded-full bg-accent/10 text-accent">
                <Pill className="h-6 w-6" />
              </div>
              <CardTitle className="font-headline text-lg">Most Common Symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{report.mostCommonSymptoms}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
               <div className="p-3 rounded-full bg-destructive/10 text-destructive">
                <Syringe className="h-6 w-6" />
              </div>
              <CardTitle className="font-headline text-lg">Medicines Dispensed</CardTitle>
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
