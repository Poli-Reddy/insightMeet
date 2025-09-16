import type { AnalysisData, TranscriptEntry, ParticipationMetric, EmotionTimelinePoint, RelationshipGraphData } from './types';

const NUM_SPEAKERS = 16;
const MEETING_DURATION_SECONDS = 14;

const speakers = Array.from({ length: NUM_SPEAKERS }, (_, i) => String.fromCharCode(65 + i));
const speakerLabels = speakers.map(s => `Speaker ${s}`);

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = <T>(arr: T[]): T => arr[getRandomInt(0, arr.length - 1)];

const generateTranscript = (): TranscriptEntry[] => {
    const entries: TranscriptEntry[] = [];
    const sentiments: ('Positive' | 'Negative' | 'Neutral')[] = ['Positive', 'Negative', 'Neutral'];
    const emotions = ['optimistic', 'critical', 'calm', 'appreciative', 'frustrated', 'curious', 'supportive'];
    let currentTime = 0;
    let id = 1;

    // In a 14 second clip with 16 people, only a few will talk.
    const numberOfUtterances = getRandomInt(4, 7);
    const speakingOrder = Array.from({ length: numberOfUtterances }, () => getRandomElement(speakers));

    for (const speaker of speakingOrder) {
        const duration = getRandomInt(1, 3);
        if (currentTime + duration > MEETING_DURATION_SECONDS) break;

        currentTime += duration;
        const sentiment = getRandomElement(sentiments);
        entries.push({
            id: id++,
            speaker,
            label: `Speaker ${speaker}`,
            text: `This is a short statement from speaker ${speaker}.`,
            sentiment,
            emotion: getRandomElement(emotions),
            timestamp: `00:${currentTime.toString().padStart(2, '0')}`,
        });
    }
    return entries;
};

const transcript = generateTranscript();
const speakersWhoSpoke = [...new Set(transcript.map(t => t.speaker))];

const generateParticipation = (): ParticipationMetric[] => {
    const metrics: ParticipationMetric[] = [];
    let remainingTime = MEETING_DURATION_SECONDS;

    speakers.forEach((speaker, i) => {
        let speakingTime = 0;
        if (speakersWhoSpoke.includes(speaker)) {
            speakingTime = transcript
                .filter(t => t.speaker === speaker)
                .reduce((acc, t) => {
                    const timeParts = t.timestamp.split(':');
                    return acc + parseInt(timeParts[1], 10);
                }, 0) - metrics.reduce((acc, m) => acc + parseInt(m.speakingTime, 10), 0);
             speakingTime = Math.max(1, Math.min(speakingTime, remainingTime)); // Ensure at least 1 second, and not more than what's left
        }
        
        remainingTime -= speakingTime;
        if(remainingTime < 0) remainingTime = 0;

        const sentimentValues = transcript.filter(t => t.speaker === speaker).map(t => t.sentiment);
        let overallSentiment: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';
        if (sentimentValues.length > 0) {
            const pos = sentimentValues.filter(s => s === 'Positive').length;
            const neg = sentimentValues.filter(s => s === 'Negative').length;
            if (pos > neg) overallSentiment = 'Positive';
            else if (neg > pos) overallSentiment = 'Negative';
        }

        const supportive = getRandomInt(10, 80);
        const conflict = getRandomInt(5, 40);
        const neutral = 100 - supportive - conflict;

        metrics.push({
            speaker,
            label: `Speaker ${speaker}`,
            speakingTime: `${speakingTime} sec`,
            supportive,
            conflict,
            neutral,
            sentiment: overallSentiment,
        });
    });

    // Ensure total time doesn't exceed duration
    let totalSpeakingTime = metrics.reduce((sum, m) => sum + parseInt(m.speakingTime), 0);
    let timeDiscrepancy = totalSpeakingTime - MEETING_DURATION_SECONDS;
    if (timeDiscrepancy > 0) {
        let activeSpeakers = metrics.filter(m => parseInt(m.speakingTime) > 0);
        while(timeDiscrepancy > 0 && activeSpeakers.length > 0) {
           let speakerToAdjust = getRandomElement(activeSpeakers);
           let currentSpeakingTime = parseInt(speakerToAdjust.speakingTime);
           if(currentSpeakingTime > 0){
               speakerToAdjust.speakingTime = `${currentSpeakingTime-1} sec`;
               timeDiscrepancy--;
           }
           activeSpeakers = metrics.filter(m => parseInt(m.speakingTime) > 0);
        }
    }


    return metrics;
};


const participation = generateParticipation();

const generateEmotionTimeline = (): EmotionTimelinePoint[] => {
    const timeline: EmotionTimelinePoint[] = [];
    const numPoints = 8;
    for (let i = 0; i <= numPoints; i++) {
        const time = Math.floor(i * (MEETING_DURATION_SECONDS / numPoints));
        const point: EmotionTimelinePoint = { time: `0:${time.toString().padStart(2, '0')}` };
        speakers.forEach(s => {
            if (speakersWhoSpoke.includes(s)) {
                point[s] = Math.random() * 1.8 - 0.9; // Fluctuate sentiment
            } else {
                point[s] = 0; // No sentiment if didn't speak
            }
        });
        timeline.push(point);
    }
    return timeline;
};

const generateRelationshipGraph = (): RelationshipGraphData => {
    const nodes = speakers.map((s, i) => ({
        id: s,
        label: `Speaker ${s}`,
        group: (i % 5) + 1, // 5 distinct groups for colors
    }));

    const links: { source: string, target: string, type: 'support' | 'conflict' | 'neutral', value: number }[] = [];
    const spokenPairs: [string, string][] = [];

    if (transcript.length > 1) {
        for (let i = 0; i < transcript.length - 1; i++) {
            spokenPairs.push([transcript[i].speaker, transcript[i + 1].speaker]);
        }
    }
    
    // Create links between speakers who spoke consecutively
    for (const [source, target] of spokenPairs) {
        if(source !== target && !links.find(l => (l.source === source && l.target === target) || (l.source === target && l.target === source))) {
            const type = getRandomElement<'support' | 'conflict' | 'neutral'>(['support', 'conflict', 'neutral']);
            links.push({ source, target, type, value: getRandomInt(1, 3) });
        }
    }

    // Add a few more random links for visual interest, even between non-speakers
    const extraLinks = getRandomInt(2, 5);
     for (let i = 0; i < extraLinks; i++) {
        const source = getRandomElement(speakers);
        let target = getRandomElement(speakers);
        while (source === target) {
            target = getRandomElement(speakers);
        }
        if(!links.find(l => (l.source === source && l.target === target) || (l.source === target && l.target === source))) {
            const type = getRandomElement<'support' | 'conflict' | 'neutral'>(['neutral', 'neutral', 'support']);
            links.push({ source, target, type, value: 1 });
        }
    }

    return { nodes, links };
};

export const mockAnalysisData: AnalysisData = {
  summary: {
    title: "Project Phoenix Sync - 14sec Clip",
    overallSentiment: "Mixed",
    points: [
      "Quick check-in regarding the upcoming deadline.",
      "Speaker A confirms the final assets are ready for review.",
      "Speaker D raises a potential conflict with another team's deployment schedule.",
      "Speaker G suggests a brief follow-up to deconflict the schedules.",
    ],
    relationshipSummary: "Initial discussion shows a collaborative tone, with Speaker G providing support to Speaker D's concern. Most participants were listening.",
  },
  transcript,
  participation,
  emotionTimeline: generateEmotionTimeline(),
  relationshipGraph: generateRelationshipGraph(),
};
