import { config } from 'dotenv';
config();

import '@/ai/flows/automated-transcription.ts';
import '@/ai/flows/sentiment-analysis.ts';
import '@/ai/flows/summary-report-generation.ts';
import '@/ai/flows/interactive-relationship-graph.ts';