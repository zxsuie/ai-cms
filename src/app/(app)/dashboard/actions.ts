
'use server';

import { z } from 'zod';
import { suggestDiagnosis } from '@/ai/flows/ai-symptom-suggestion';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { logVisitSchema } from '@/lib/types';
import { generateExcuseSlip } from '@/ai/flows/ai-excuse-slip-generator';
import { format } from 'date-fns';

const SuggestionSchema = z.object({
  symptoms: z.string().min(10, "Please enter at least 10 characters of symptoms."),
});

export async function getAiSymptomSuggestion(input: { symptoms: string }) {
  const parsed = SuggestionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Invalid input for AI suggestion.' };
  }
  
  try {
    const result = await suggestDiagnosis({ symptoms: parsed.data.symptoms });
    return { suggestions: result.suggestions };
  } catch (error) {
    return { error: 'Failed to get AI suggestion.' };
  }
}

export async function logStudentVisit(data: z.infer<typeof logVisitSchema>) {
  try {
    const aiResult = await suggestDiagnosis({ symptoms: data.symptoms });
    const aiSuggestion = aiResult.suggestions || 'No suggestion available.';

    const newVisit = await db.addVisit({ ...data, aiSuggestion });
    
    await db.addActivityLog('visit_logged', { 
      studentName: newVisit.studentName, 
      visitId: newVisit.id 
    });

    revalidatePath('/dashboard');
    revalidatePath('/logs');
    return { success: true, message: 'Visit logged successfully.' };
  } catch (error) {
    console.error('Failed to log visit:', error);
    return { success: false, message: 'Failed to log visit.' };
  }
}

export async function generateAndSaveReleaseForm(visitId: string) {
  // In a real app, this would generate a PDF and upload to Firebase Storage
  // Here we simulate it by generating a fake link and saving it.
  const fakePdfLink = `/release-forms/form-${visitId}-${Date.now()}.pdf`;
  
  await db.addReleaseFormLink(visitId, fakePdfLink);
  await db.addActivityLog('release_form_generated', { visitId, link: fakePdfLink });

  revalidatePath('/dashboard');
  revalidatePath('/logs');
  
  return { success: true, message: 'Release form generated and linked.', link: fakePdfLink };
}


export async function generateExcuseSlipAction(visit: {
  studentName: string;
  timestamp: string;
  symptoms: string;
  reason: string;
}) {
  try {
    const result = await generateExcuseSlip({
      studentName: visit.studentName,
      visitDate: format(new Date(visit.timestamp), 'PPP'),
      symptoms: visit.symptoms,
      reason: visit.reason,
    });
    
    await db.addActivityLog('excuse_slip_generated', { 
      studentName: visit.studentName, 
    });
    revalidatePath('/logs');

    return { success: true, excuseSlip: result.excuseSlipText };
  } catch (error) {
    console.error('Excuse slip generation failed:', error);
    return { success: false, error: 'Failed to generate AI excuse slip.' };
  }
}
