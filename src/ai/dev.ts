import { config } from 'dotenv';
config();

import '@/ai/flows/ai-symptom-suggestion.ts';
import '@/ai/flows/ai-report-generator.ts';
import '@/ai/flows/ai-excuse-slip-generator.ts';
import '@/ai/flows/ai-symptom-analyzer.ts';
