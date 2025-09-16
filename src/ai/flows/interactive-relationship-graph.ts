'use server';

/**
 * @fileOverview Generates a graph visualizing the relationships between meeting participants.
 *
 * - generateRelationshipGraph - A function that generates the relationship graph.
 * - RelationshipGraphInput - The input type for the generateRelationshipGraph function.
 * - RelationshipGraphOutput - The return type for the generateRelationshipGraph function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RelationshipGraphInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the meeting with speaker tags and sentiment.'),
});
export type RelationshipGraphInput = z.infer<typeof RelationshipGraphInputSchema>;

const RelationshipGraphOutputSchema = z.object({
  graphData: z.string().describe('JSON string representing the relationship graph data.'),
});
export type RelationshipGraphOutput = z.infer<typeof RelationshipGraphOutputSchema>;

export async function generateRelationshipGraph(input: RelationshipGraphInput): Promise<RelationshipGraphOutput> {
  return relationshipGraphFlow(input);
}

const prompt = ai.definePrompt({
  name: 'relationshipGraphPrompt',
  input: {schema: RelationshipGraphInputSchema},
  output: {schema: RelationshipGraphOutputSchema},
  prompt: `You are an AI assistant that analyzes meeting transcripts and generates relationship graphs.

  Analyze the following meeting transcript to identify relationships between participants. Relationships can be supportive, neutral, or conflicting.  Provide the output as JSON that can be directly used by D3.js to render a graph.

  The JSON should have the following format:
  {
    "nodes": [
      {"id": "A", "group": 1, "label": "Speaker A"},
      {"id": "B", "group": 2, "label": "Speaker B"},
      ...
    ],
    "links": [
      {"source": "A", "target": "B", "value": 1, "type": "conflict"},
      {"source": "B", "target": "C", "value": 2, "type": "support"},
      ...
    ]
  }

  Node properties:
  - id: Unique identifier for each participant (e.g., "A", "B", "C").
  - group: A numeric category (starting from 1) used for node coloring (e.g., 1, 2, 3).
  - label: A display name for the node (e.g., "Speaker A (Black shirt)").

  Link properties:
  - source: ID of the source participant.
  - target: ID of the target participant.
  - value: A numeric value representing the strength or frequency of the interaction.
  - type: The type of relationship ("support", "neutral", or "conflict").

  Transcript:
  {{{transcript}}}
  `,
});

const relationshipGraphFlow = ai.defineFlow(
  {
    name: 'relationshipGraphFlow',
    inputSchema: RelationshipGraphInputSchema,
    outputSchema: RelationshipGraphOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
