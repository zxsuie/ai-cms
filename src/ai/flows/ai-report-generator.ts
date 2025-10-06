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
  visitData: z.string().describe('A JSON string of student visit data.'),
  medicineData: z.string().describe('A JSON string of medicine inventory data.'),
});
export type GenerateAiReportInput = z.infer<typeof GenerateAiReportInputSchema>;

const GenerateAiReportOutputSchema = z.object({
  totalVisits: z.number().describe('The total number of student visits for the period.'),
  summaryText: z.string().describe('A brief narrative summary of the clinic activity.'),
  mostCommonSymptoms: z.array(z.string()).describe('A list of the most common symptoms reported.'),
  medicinesDispensed: z.string().describe('A summary of medicines dispensed and stock levels.'),
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
  prompt: `You are an AI data analyst for a school clinic. Your task is to generate a {{{reportType}}} report by analyzing the provided JSON data.

Analyze the 'Student Visit Data' to understand the clinic's activity. Pay close attention to the 'symptoms' and 'reason' fields to identify trends.

Based on your analysis, provide the following structured data:
1.  **totalVisits**: Calculate the exact total number of student visits from the data.
2.  **summaryText**: Write a brief narrative summary of the clinic's activity for the period.
3.  **mostCommonSymptoms**: Identify and return a JavaScript array of the most frequent symptoms or reasons for visits (e.g., ["Headache", "Stomach ache", "Common Cold"]).
4.  **medicinesDispensed**: Summarize medicine-related activities, noting which medicines are used most.

Student Visit Data:
\`\`\`json
{{{visitData}}}
\`\`\`

Medicine Data:
\`\`\`json
{{{medicineData}}}
\`\`\`
`,
});

const generateAiReportFlow = ai.defineFlow(
  {
    name: 'generateAiReportFlow',
    inputSchema: GenerateAiReportInputSchema,
    outputSchema: GenerateAiReportOutputSchema,
  },
  async input => {
    // The data is already in JSON string format, so we can pass it directly to the prompt.
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a report.');
    }
    return output;
  }
);
