'use server';

/**
 * @fileOverview A flow for automatically transcribing meeting audio using Whisper-large-v3.
 *
 * - transcribeAudio - A function that transcribes audio from a meeting recording.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio data URI of the meeting recording.  Must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  domainSpecificDictionary: z
    .string()
    .optional()
    .describe('A custom dictionary of company-specific terms and names.'),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcript: z.string().describe('The transcribed text of the meeting audio.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcribeAudioPrompt = ai.definePrompt({
  name: 'transcribeAudioPrompt',
  input: {schema: TranscribeAudioInputSchema},
  output: {schema: TranscribeAudioOutputSchema},
  prompt: `You are a transcription expert specializing in accurately transcribing meeting recordings.

You will receive an audio recording of a meeting and must transcribe it as accurately as possible.

If a domain-specific dictionary is provided, you will prioritize those terms when transcribing.

Audio: {{media url=audioDataUri}}

{{#if domainSpecificDictionary}}
Domain-Specific Dictionary: {{{domainSpecificDictionary}}}
{{/if}}
`,
});

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async input => {
    const {output} = await transcribeAudioPrompt(input);
    return output!;
  }
);
