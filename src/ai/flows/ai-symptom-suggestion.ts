
'use server';

/**
 * @fileOverview An AI agent that suggests possible diagnoses or next steps based on entered symptoms.
 *
 * - suggestDiagnosis - A function that handles the symptom diagnosis suggestion process.
 * - SuggestDiagnosisInput - The input type for the suggestDiagnosis function.
 * - SuggestDiagnosisOutput - The return type for the suggestDiagnosis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDiagnosisInputSchema = z.object({
  symptoms: z
    .string()
    .describe('The symptoms observed in the visitor.'),
  role: z.enum(['student', 'employee', 'staff']).describe("The role of the visitor (student, employee, or staff)."),
  studentDetails: z.string().optional().describe('Additional details about the visitor, such as age, course, job title, or medical history.'),
});
export type SuggestDiagnosisInput = z.infer<typeof SuggestDiagnosisInputSchema>;

const SuggestDiagnosisOutputSchema = z.object({
  suggestions: z.string().describe('AI-powered suggestions for possible diagnoses or next steps.'),
});
export type SuggestDiagnosisOutput = z.infer<typeof SuggestDiagnosisOutputSchema>;

export async function suggestDiagnosis(input: SuggestDiagnosisInput): Promise<SuggestDiagnosisOutput> {
  return suggestDiagnosisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDiagnosisPrompt',
  input: {schema: SuggestDiagnosisInputSchema},
  output: {schema: SuggestDiagnosisOutputSchema},
  prompt: `You are an AI assistant for a school nurse. Based on the symptoms, role, and other details provided, suggest possible diagnoses or next steps for the nurse to consider. Provide a brief, professional summary of your reasoning. The visitor's role and details are important context (e.g., a student might have exam stress, an employee in a specific department might have work-related strain).

Visitor Role: {{{role}}}
Visitor Details: {{{studentDetails}}}
Symptoms: {{{symptoms}}}

Suggestions:`,
});

const suggestDiagnosisFlow = ai.defineFlow(
  {
    name: 'suggestDiagnosisFlow',
    inputSchema: SuggestDiagnosisInputSchema,
    outputSchema: SuggestDiagnosisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
