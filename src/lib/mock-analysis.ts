import type { AnalysisData } from './types';

export const mockAnalysisData: AnalysisData = {
  summary: {
    title: "Q4 Strategy Review",
    overallSentiment: "Neutral-leaning Negative",
    points: [
      "The primary topic was the potential market expansion into Europe.",
      "Speaker A presented a strong, data-backed case for expansion, highlighting promising market research.",
      "Speaker B raised significant concerns about the financial viability, citing high costs and overly optimistic projections.",
      "Speaker C proposed a compromise in the form of a smaller, targeted pilot program to gather more data and mitigate risks.",
    ],
    relationshipSummary: "Speaker A and Speaker C demonstrated a supportive dynamic, building on each other's ideas. A significant conflict axis was observed between Speaker B and Speaker A.",
  },
  transcript: [
    { id: 1, speaker: 'A', label: 'Speaker A (Black Shirt)', text: "I think we should expand to Europe. The market research looks very promising.", sentiment: 'Positive', emotion: 'optimistic', timestamp: '00:02' },
    { id: 2, speaker: 'B', label: 'Speaker B (Red Shirt)', text: "I disagree. The costs are too high and the projections are overly optimistic.", sentiment: 'Negative', emotion: 'critical', timestamp: '00:05' },
    { id: 3, speaker: 'C', label: 'Speaker C (White Shirt)', text: "Maybe we can test the waters with a small pilot program first? That could mitigate the risk B is talking about.", sentiment: 'Neutral', emotion: 'calm', timestamp: '00:08' },
    { id: 4, speaker: 'A', label: 'Speaker A (Black Shirt)', text: "That's a constructive idea, C. A pilot would give us the data we need to make a bigger decision without full-scale commitment.", sentiment: 'Positive', emotion: 'appreciative', timestamp: '00:11' },
    { id: 5, speaker: 'B', label: 'Speaker B (Red Shirt)', text: "A pilot is still a waste of resources if the fundamental market isn't there.", sentiment: 'Negative', emotion: 'frustrated', timestamp: '00:14' },
  ],
  participation: [
    { speaker: 'A', label: 'Speaker A (Black Shirt)', speakingTime: '6 sec', supportive: 65, conflict: 20, neutral: 15, sentiment: 'Positive' },
    { speaker: 'B', label: 'Speaker B (Red Shirt)', speakingTime: '5 sec', supportive: 10, conflict: 70, neutral: 20, sentiment: 'Negative' },
    { speaker: 'C', label: 'Speaker C (White Shirt)', speakingTime: '3 sec', supportive: 55, conflict: 10, neutral: 35, sentiment: 'Neutral' },
  ],
  emotionTimeline: [
    { time: '0:00', A: 0, B: 0, C: 0 },
    { time: '0:02', A: 0.8, B: 0, C: 0 },
    { time: '0:05', A: 0.8, B: -0.7, C: 0 },
    { time: '0:08', A: 0.6, B: -0.6, C: 0.2 },
    { time: '0:11', A: 0.9, B: -0.5, C: 0.3 },
    { time: '0:14', A: 0.7, B: -0.8, C: 0.4 },
  ],
  relationshipGraph: {
    nodes: [
      { id: 'A', label: 'Speaker A', group: 1 },
      { id: 'B', label: 'Speaker B', group: 2 },
      { id: 'C', label: 'Speaker C', group: 3 },
    ],
    links: [
      { source: 'A', target: 'B', type: 'conflict', value: 2 },
      { source: 'B', target: 'A', type: 'conflict', value: 2 },
      { source: 'A', target: 'C', type: 'support', value: 2 },
      { source: 'C', target: 'A', type: 'support', value: 1 },
      { source: 'C', target: 'B', type: 'neutral', value: 1 },
    ],
  },
};
