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
  appointmentData: z.string().describe('A JSON string of scheduled appointment data.'),
});
export type GenerateAiReportInput = z.infer<typeof GenerateAiReportInputSchema>;

const GenerateAiReportOutputSchema = z.object({
  totalVisits: z.number().describe('The total number of student visits for the period.'),
  totalAppointments: z.number().describe('The total number of scheduled appointments for the period.'),
  summaryText: z.string().describe('A brief narrative summary of all clinic activity (visits and appointments). Use Markdown for bolding key numbers and trends (e.g., **45 visits**).'),
  mostCommonSymptoms: z.array(z.string()).describe('A list of the most common symptoms reported from visits.'),
  medicinesDispensed: z.string().describe('A summary of medicines dispensed and stock levels. Use Markdown for bolding key medicine names and quantities (e.g., **Paracetamol (50)**).'),
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

Analyze the 'Student Visit Data' and 'Appointment Data' to understand the clinic's activity. Pay close attention to the 'symptoms' and 'reason' fields to identify trends.

Based on your analysis, provide the following structured data:
1.  **totalVisits**: Calculate the exact total number of student visits from the visit data.
2.  **totalAppointments**: Calculate the exact total number of appointments from the appointment data.
3.  **summaryText**: Write a brief narrative summary of the clinic's overall activity, including both visits and appointments. Use Markdown to bold key numbers, trends, or insights (e.g., "There were **45 visits** and **12 appointments** this week, a **15% increase** from the previous period.").
4.  **mostCommonSymptoms**: Identify and return a JavaScript array of the most frequent symptoms or reasons for visits (e.g., ["Headache", "Stomach ache", "Common Cold"]).
5.  **medicinesDispensed**: Summarize medicine-related activities, noting which medicines are used most. Use Markdown to bold medicine names and quantities dispensed (e.g., "The most dispensed medicine was **Paracetamol (50 units)**, followed by **Ibuprofen (30 units)**.").

Student Visit Data:
\`\`\`json
{{{visitData}}}
\`\`\`

Medicine Data:
\`\`\`json
{{{medicineData}}}
\`\`\`

Appointment Data:
\`\`\`json
{{{appointmentData}}}
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
