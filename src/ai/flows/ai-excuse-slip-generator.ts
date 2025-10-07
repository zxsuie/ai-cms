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
  prompt: `You are an AI assistant for a school nurse. Your task is to write a formal student excuse slip.

Generate a polite and professional excuse slip based on the provided details. The slip should state the student's name, the date of the visit, and a brief, non-technical reason for their visit or absence. Do not include overly-detailed medical information.

Student Name: {{{studentName}}}
Visit Date: {{{visitDate}}}
Symptoms Reported: {{{symptoms}}}
Reason for Visit: {{{reason}}}

Please generate the complete text for the excuse slip. Start with the clinic name "iClinicMate", the date, a proper salutation (e.g., "To Whom It May Concern,"), the body of the letter, and a closing (e.g., "Sincerely, School Nurse").`,
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
    return output;
  }
);
