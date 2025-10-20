
'use server';

import { z } from 'zod';
import { suggestDiagnosis } from '@/ai/flows/ai-symptom-suggestion';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { logVisitSchema } from '@/lib/types';
import { generateExcuseSlip } from '@/ai/flows/ai-excuse-slip-generator';
import { format } from 'date-fns';
import { analyzeSymptoms } from '@/ai/flows/ai-symptom-analyzer';

const SuggestionSchema = z.object({
  symptoms: z.string().min(10, "Please enter at least 10 characters of symptoms."),
  role: z.enum(['student', 'employee', 'staff']),
  details: z.string().optional(),
});

export async function getAiSymptomSuggestion(input: z.infer<typeof SuggestionSchema>) {
  const parsed = SuggestionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Invalid input for AI suggestion.' };
  }
  
  try {
    const result = await suggestDiagnosis({ 
        symptoms: parsed.data.symptoms,
        role: parsed.data.role,
        studentDetails: parsed.data.details,
    });
    return { suggestions: result.suggestions };
  } catch (error) {
    return { error: 'Failed to get AI suggestion.' };
  }
}

export async function logStudentVisit(data: z.infer<typeof logVisitSchema>, userName: string) {
  try {
    // 1. Log the basic visit first, without AI content.
    const newVisit = await db.addVisit(data);

    // 2. Add to activity log immediately.
    await db.addActivityLog('visit_logged', { 
      studentName: newVisit.studentName, 
      visitId: newVisit.id 
    }, userName);

    // Revalidate paths so the UI updates with the basic info.
    revalidatePath('/dashboard');
    revalidatePath('/logs');

    // 3. Try to get AI content and update the visit record.
    let aiSuggestion = 'No suggestion available.';
    let excuseLetterText = 'Could not generate excuse slip.';

    try {
        const aiResult = await suggestDiagnosis({ 
            symptoms: data.symptoms, 
            role: data.role,
            studentDetails: `${data.studentYear} - ${data.studentSection}`
        });
        aiSuggestion = aiResult.suggestions || 'No suggestion available.';
    } catch (e) {
        console.error("AI suggestion failed:", e);
    }

    try {
        const excuseSlipResult = await generateExcuseSlip({
            studentName: data.studentName,
            visitDate: format(new Date(), 'PPP'),
            symptoms: data.symptoms,
            reason: data.reason,
        });
        excuseLetterText = excuseSlipResult.excuseSlipText;
    } catch (e) {
        console.error("Excuse slip generation failed:", e);
    }
    
    // 4. Update the visit with AI content.
    await db.updateVisitAiContent(newVisit.id, aiSuggestion, excuseLetterText);
    
    // Revalidate again to show the AI content.
    revalidatePath('/dashboard');

    return { success: true, message: 'Visit logged successfully.', visit: newVisit };
  } catch (error) {
    console.error('Failed to log visit:', error);
    return { success: false, message: 'Failed to log visit.' };
  }
}


export async function generateAndSaveReleaseForm(visitId: string, userName: string) {
  // In a real app, this would generate a PDF and upload to Firebase Storage
  // Here we simulate it by generating a fake link and saving it.
  const fakePdfLink = `/release-forms/form-${visitId}-${Date.now()}.pdf`;
  
  await db.addReleaseFormLink(visitId, fakePdfLink);
  await db.addActivityLog('release_form_generated', { visitId, link: fakePdfLink }, userName);

  revalidatePath('/dashboard');
  revalidatePath('/logs');
  
  return { success: true, message: 'Release form generated and linked.', link: fakePdfLink };
}


export async function generateExcuseSlipAction(
    visit: {
        id: string;
        studentName: string;
        timestamp: string;
        symptoms: string;
        reason: string;
    },
    userName: string
) {
  try {
    const result = await generateExcuseSlip({
      studentName: visit.studentName,
      visitDate: format(new Date(visit.timestamp), 'PPP'),
      symptoms: visit.symptoms,
      reason: visit.reason,
    });
    
    // Save the generated slip to the database
    await db.updateExcuseLetterText(visit.id, result.excuseSlipText);
    
    await db.addActivityLog('excuse_slip_generated', { 
      studentName: visit.studentName, 
    }, userName);

    revalidatePath('/logs');
    revalidatePath('/dashboard');

    return { success: true, excuseSlip: result.excuseSlipText };
  } catch (error) {
    console.error('Excuse slip generation failed:', error);
    return { success: false, error: 'Failed to generate AI excuse slip.' };
  }
}

export async function updateExcuseLetterAction(visitId: string, newText: string) {
  try {
    await db.updateExcuseLetterText(visitId, newText);
    revalidatePath('/dashboard');
    return { success: true, message: 'Excuse letter updated.' };
  } catch (error) {
    console.error('Failed to update excuse letter:', error);
    return { success: false, message: 'Failed to update excuse letter.' };
  }
}

export async function getAiSymptomAnalysis() {
  try {
    const visits = await db.getVisitsLast30Days();
    const appointments = await db.getAppointmentsLast30Days();

    const symptomTexts = [
      ...visits.map(v => v.symptoms),
      ...visits.map(v => v.reason),
      ...appointments.map(a => a.reason),
    ].filter(Boolean); // Filter out any empty strings

    if (symptomTexts.length === 0) {
        return { success: true, symptomsSummary: [] };
    }

    const result = await analyzeSymptoms({symptomTexts});
    return { success: true, ...result };
  } catch (error) {
    console.error("AI symptom analysis failed:", error);
    return { success: false, error: "Failed to analyze symptoms with AI." };
  }
}

export async function getPatientOverview() {
  try {
    const visits = await db.getVisits();
    const overview = visits.reduce((acc, visit) => {
        acc[visit.role] = (acc[visit.role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const data = [
      { name: 'Students', value: overview.student || 0, fill: '#4B7BEC' },
      { name: 'Employees', value: overview.employee || 0, fill: '#3CB371' },
      { name: 'Staff', value: overview.staff || 0, fill: '#FFA500' },
    ];
    return { success: true, data };
  } catch(error) {
    console.error("Patient overview failed:", error);
    return { success: false, error: "Failed to fetch patient overview data." };
  }
}
