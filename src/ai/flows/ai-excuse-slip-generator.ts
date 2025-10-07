
'use server';

/**
 * @fileOverview An AI agent that generates a student excuse slip.
 *
 * - generateExcuseSlip - A function that handles the excuse slip generation process.
 * - GenerateExcuseSlipInput - The input type for the generateExcuseSlip function.
 * - GenerateExcuseSlipOutput - The return type for the generateExcuseSlip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExcuseSlipInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  visitDate: z.string().describe('The date of the clinic visit (e.g., "October 7, 2025").'),
  symptoms: z.string().describe('The symptoms reported by the student.'),
  reason: z.string().describe('The reason for the student\'s visit.'),
});
export type GenerateExcuseSlipInput = z.infer<typeof GenerateExcuseSlipInputSchema>;

const GenerateExcuseSlipOutputSchema = z.object({
  excuseSlipText: z.string().describe('The fully-formatted text for a student excuse slip, including date, salutation, body, and closing. Use Markdown for formatting and ensure newlines (\\n) separate paragraphs.'),
});
export type GenerateExcuseSlipOutput = z.infer<typeof GenerateExcuseSlipOutputSchema>;

export async function generateExcuseSlip(input: GenerateExcuseSlipInput): Promise<GenerateExcuseSlipOutput> {
  return generateExcuseSlipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExcuseSlipPrompt',
  input: {schema: GenerateExcuseSlipInputSchema},
  output: {schema: GenerateExcuseSlipOutputSchema},
  prompt: `You are an AI assistant for a school nurse named "Nurse Manuel". Your task is to write a formal, context-rich student excuse slip based on the provided visit details. The tone should be professional and suitable for a school environment.

**IMPORTANT INSTRUCTIONS:**
*   **Use Newlines:** You MUST use newline characters (\\n) to separate paragraphs and lines (e.g., between the salutation, body paragraphs, and closing).
*   **Use Markdown for Bolding:** Use double asterisks (**) to bold key information like the student's name and the date.

**Structure:**
1.  **Salutation:** "To Whom It May Concern," followed by a double newline (\\n\\n).
2.  **Body Paragraph 1 (Certification):** State clearly that the student visited the clinic. Include the student's full name, the date of the visit, and the reason. Combine the provided 'reason' and 'symptoms' into a professional-sounding description. (e.g., "...due to experiencing dizziness and a headache."). End with a double newline (\\n\\n).
3.  **Body Paragraph 2 (Action/Recommendation):** Briefly explain the assessment or action taken. (e.g., "Upon assessment, the student was advised to rest..."). End with a double newline (\\n\\n).
4.  **Closing Paragraph:** Politely request that the student's absence be excused. (e.g., "Please excuse the student's absence from class..."). End with a double newline (\\n\\n).
5.  **Signature:** End with "Sincerely," then a newline (\\n), then "Nurse Manuel", then a final newline (\\n) and "School Clinic".

**Input Data:**
*   Student Name: {{{studentName}}}
*   Visit Date: {{{visitDate}}}
*   Symptoms Reported: {{{symptoms}}}
*   Reason for Visit: {{{reason}}}
`,
});

const generateExcuseSlipFlow = ai.defineFlow(
  {
    name: 'generateExcuseSlipFlow',
    inputSchema: GenerateExcuseSlipInputSchema,
    outputSchema: GenerateExcuseSlipOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate an excuse slip.');
    }
    // A simple text replace to make the output cleaner and remove the markdown from the AI.
    let cleanedText = output.excuseSlipText.replace(/#+\s/g, '');
    return { excuseSlipText: cleanedText };
  }
);
