'use server';

import { generateAiReport } from "@/ai/flows/ai-report-generator";
import { db } from "@/lib/db";

type ReportType = 'weekly' | 'monthly';

export async function generateReportAction(reportType: ReportType) {
  try {
    const visitData = await db.getVisits();
    const medicineData = await db.getMedicines();

    const result = await generateAiReport({
      reportType,
      visitData: JSON.stringify(visitData),
      medicineData: JSON.stringify(medicineData),
    });

    return { success: true, report: result };
  } catch (error) {
    console.error("Report generation failed:", error);
    return { success: false, error: "Failed to generate AI report." };
  }
}
