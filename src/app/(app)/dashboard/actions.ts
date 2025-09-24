'use server';

import { z } from 'zod';
import { suggestDiagnosis } from '@/ai/flows/ai-symptom-suggestion';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { logVisitSchema } from '@/lib/types';

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

    await db.addVisit({ ...data, aiSuggestion });
    
    revalidatePath('/dashboard');
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
  revalidatePath('/dashboard');
  
  return { success: true, message: 'Release form generated and linked.', link: fakePdfLink };
}
