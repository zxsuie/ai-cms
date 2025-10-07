'use server';

import { generateAiReport } from "@/ai/flows/ai-report-generator";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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

    await db.addActivityLog('report_generated', { reportType });
    revalidatePath('/logs');

    return { success: true, report: result };
  } catch (error) {
    console.error("Report generation failed:", error);
    return { success: false, error: "Failed to generate AI report." };
  }
}

export async function getAllLogsAction() {
  try {
    const logs = await db.getActivityLogs();
    return { success: true, logs };
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return { success: false, error: "Failed to fetch activity logs." };
  }
}
