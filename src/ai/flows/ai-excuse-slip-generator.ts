
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
  excuseSlipText: z.string().describe('The fully-formatted text for a student excuse slip, including date, salutation, body, and closing. Use Markdown for formatting if needed, for example, for the clinic name at the top.'),
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

**Instructions:**
1.  **Address:** Start with a formal salutation like "To Whom It May Concern," or "Dear Teacher/Adviser,".
2.  **Body Paragraph 1 (Certification):** State clearly that the student visited the clinic. Include the student's full name, the date of the visit, and the reason. Combine the provided 'reason' and 'symptoms' into a professional-sounding description. For example, if the reason is "Felt dizzy" and symptoms are "headache, nausea", the letter could say "...due to experiencing dizziness, headache, and nausea."
3.  **Body Paragraph 2 (Action/Recommendation):** Briefly explain the assessment or action taken. For instance, "Upon assessment, the student was advised to rest and was monitored in the clinic." or "The student was given appropriate first aid and allowed to return to class after observation."
4.  **Closing:** Politely request that the student's absence from class during that time be excused.
5.  **Signature:** End with "Sincerely," followed by "Nurse Manuel" and then "School Clinic".
6.  **Formatting**: Use Markdown for bolding key information like the student's name, but do not use any other complex markdown.

**Input Data:**
*   Student Name: {{{studentName}}}
*   Visit Date: {{{visitDate}}}
*   Symptoms Reported: {{{symptoms}}}
*   Reason for Visit: {{{reason}}}

---

**Example Output Format:**

To Whom It May Concern,

This is to certify that **{{{studentName}}}** visited the school clinic on **{{{visitDate}}}** due to [professional description of reason and symptoms].

Upon assessment, the student was [action taken, e.g., advised to rest in the clinic]. He/She is now cleared to return to class.

Please excuse the student's absence from class during this time. Thank you for your understanding.

Sincerely,
Nurse Manuel
School Clinic`,
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
