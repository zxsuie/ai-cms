
'use server';

/**
 * @fileOverview An AI agent that analyzes and categorizes clinic symptoms.
 *
 * - analyzeSymptoms - A function that handles the symptom analysis process.
 * - AnalyzeSymptomsInput - The input type for the analyzeSymptoms function.
 * - AnalyzeSymptomsOutput - The return type for the analyzeSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSymptomsInputSchema = z.object({
  symptomTexts: z.array(z.string()).describe('An array of raw text strings describing symptoms or reasons for clinic visits.'),
});
export type AnalyzeSymptomsInput = z.infer<typeof AnalyzeSymptomsInputSchema>;

const SymptomSummarySchema = z.object({
    symptom: z.string().describe('The standardized name of the symptom (e.g., "Headache").'),
    count: z.number().describe('The total number of times this symptom occurred in the input data.'),
});

const AnalyzeSymptomsOutputSchema = z.object({
  symptomsSummary: z.array(SymptomSummarySchema).describe('A structured JSON array summarizing the analyzed symptoms and their counts.'),
});
export type AnalyzeSymptomsOutput = z.infer<typeof AnalyzeSymptomsOutputSchema>;

export async function analyzeSymptoms(input: AnalyzeSymptomsInput): Promise<AnalyzeSymptomsOutput> {
  return analyzeSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSymptomsPrompt',
  input: {schema: AnalyzeSymptomsInputSchema},
  output: {schema: AnalyzeSymptomsOutputSchema},
  prompt: `You are an AI medical data analyst. Analyze the following list of raw, user-entered visit reasons and symptoms from clinic logs.

Your task is to perform the following steps:
1.  Identify and extract the main medical symptom mentioned in each string.
2.  Group similar terms and synonyms under a single, standardized label (e.g., "high temperature" and "feverish" should both be grouped under "Fever").
3.  Count the total number of occurrences for each standardized symptom.
4.  Return ONLY the final structured JSON output in the format specified. Do not include any other text or explanation.

Input Data (as a JavaScript array of strings):
\`\`\`json
{{{jsonEncode symptomTexts}}}
\`\`\`
`,
});

const analyzeSymptomsFlow = ai.defineFlow(
  {
    name: 'analyzeSymptomsFlow',
    inputSchema: AnalyzeSymptomsInputSchema,
    outputSchema: AnalyzeSymptomsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a symptom analysis.');
    }
    return output;
  }
);
