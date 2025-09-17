'use server';

/**
 * @fileOverview An AI report generator for student visit data.
 *
 * - generateAiReport - A function that generates the AI report.
 * - GenerateAiReportInput - The input type for the generateAiReport function.
 * - GenerateAiReportOutput - The return type for the generateAiReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiReportInputSchema = z.object({
  reportType: z
    .enum(['weekly', 'monthly'])
    .describe('The type of report to generate (weekly or monthly).'),
  visitData: z.string().describe('The student visit data in JSON format.'),
  medicineData: z.string().describe('The medicine data in JSON format.'),
});
export type GenerateAiReportInput = z.infer<typeof GenerateAiReportInputSchema>;

const GenerateAiReportOutputSchema = z.object({
  summary: z.string().describe('A summary of the student visit data.'),
  mostCommonSymptoms: z
    .string()
    .describe('The most common symptoms reported.'),
  medicinesDispensed: z.string().describe('A summary of medicines dispensed.'),
});
export type GenerateAiReportOutput = z.infer<typeof GenerateAiReportOutputSchema>;

export async function generateAiReport(input: GenerateAiReportInput): Promise<GenerateAiReportOutput> {
  return generateAiReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiReportPrompt',
  input: {
    schema: GenerateAiReportInputSchema,
  },
  output: {
    schema: GenerateAiReportOutputSchema,
  },
  prompt: `You are an AI assistant tasked with generating a report based on student visit data and medicine data.

  The report type is: {{{reportType}}}

  Student Visit Data:
  {{visitData}}

  Medicine Data:
  {{medicineData}}

  Generate a summary of the student visit data, including the number of visits, most common symptoms, and a summary of medicines dispensed.
  `,
});

const generateAiReportFlow = ai.defineFlow(
  {
    name: 'generateAiReportFlow',
    inputSchema: GenerateAiReportInputSchema,
    outputSchema: GenerateAiReportOutputSchema,
  },
  async input => {
    try {
      // Parse the JSON strings into JavaScript objects
      const visitData = JSON.parse(input.visitData);
      const medicineData = JSON.parse(input.medicineData);

      // Call the prompt with the parsed data
      const {output} = await prompt({...input, visitData, medicineData});
      return output!;
    } catch (error: any) {
      console.error('Error parsing JSON data or generating report:', error);
      throw new Error(`Failed to generate AI report: ${error.message}`);
    }
  }
);
