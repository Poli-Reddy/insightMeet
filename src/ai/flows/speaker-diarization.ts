'use server';

/**
 * @fileOverview A flow for performing speaker diarization on audio.
 *
 * - diarizeAudio - A function that transcribes audio and identifies who spoke when.
 * - DiarizeAudioInput - The input type for the diarizeAudio function.
 * - DiarizeAudioOutput - The return type for the diarizeAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiarizeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio data URI of the meeting recording. Must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type DiarizeAudioInput = z.infer<typeof DiarizeAudioInputSchema>;

const UtteranceSchema = z.object({
    speaker: z.number().describe('The identified speaker index (e.g., 0, 1, 2).'),
    text: z.string().describe('The transcribed text of the utterance.'),
});

const DiarizeAudioOutputSchema = z.object({
  utterances: z.array(UtteranceSchema).describe('A list of utterances with speaker tags and text.'),
});
export type DiarizeAudioOutput = z.infer<typeof DiarizeAudioOutputSchema>;

export async function diarizeAudio(input: DiarizeAudioInput): Promise<DiarizeAudioOutput> {
  return diarizeAudioFlow(input);
}

// Note: This is a simplified prompt. A real production prompt for diarization
// would be more complex and likely part of a model that's specifically trained for it.
// We are using a powerful model that can handle this in a single step for demonstration.
const diarizeAudioPrompt = ai.definePrompt({
  name: 'diarizeAudioPrompt',
  input: {schema: DiarizeAudioInputSchema},
  output: {schema: DiarizeAudioOutputSchema},
  prompt: `You are an expert in speaker diarization. Analyze the following audio and transcribe it, identifying each speaker. The output should be a list of utterances, where each utterance has a speaker number and the corresponding text.

For example:
- Speaker 0: "Hello, everyone."
- Speaker 1: "Hi, good to be here."
- Speaker 0: "Let's get started."

Audio: {{media url=audioDataUri}}
`,
});

const diarizeAudioFlow = ai.defineFlow(
  {
    name: 'diarizeAudioFlow',
    inputSchema: DiarizeAudioInputSchema,
    outputSchema: DiarizeAudioOutputSchema,
  },
  async (input) => {
    // In a real-world scenario, you might use a specific model for diarization.
    // For this example, we'll use a powerful general model capable of this task.
    const {output} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: diarizeAudioPrompt.prompt,
      input: input,
      output: {
        schema: DiarizeAudioOutputSchema,
      },
      config: {
        // Higher temperature can help in distinguishing nuanced speaker changes,
        // but can also lead to more errors. This is a tunable parameter.
        temperature: 0.3,
      }
    });

    return output!;
  }
);
