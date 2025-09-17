import { ReportGenerator } from "@/components/reports/report-generator";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">AI Report Generator</h1>
        <p className="text-muted-foreground">
          Generate weekly or monthly summaries of clinic activity.
        </p>
      </div>
      <ReportGenerator />
    </div>
  );
}
