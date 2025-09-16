import type { AnalysisData, TranscriptEntry, ParticipationMetric, EmotionTimelinePoint, RelationshipGraphData } from './types';

const NUM_SPEAKERS = 16;
const MEETING_DURATION_SECONDS = 14;

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = <T>(arr: T[]): T => arr[getRandomInt(0, arr.length - 1)];

const genders = ['Man', 'Woman'];
const clothingTypes = ['shirt', 't-shirt', 'blouse', 'hoodie', 'sweater'];
const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'gray'];
const accessories = ['with glasses', 'with a headset', '', '']; // '' for no accessory

const generateDescriptiveLabel = () => {
    const gender = getRandomElement(genders);
    const clothing = getRandomElement(clothingTypes);
    const color = getRandomElement(colors);
    const accessory = getRandomElement(accessories);

    let label = `${gender} in a ${color} ${clothing}`;
    if (accessory) {
        label += ` ${accessory}`;
    }
    return label;
};


const speakers = Array.from({ length: NUM_SPEAKERS }, (_, i) => ({
    id: String.fromCharCode(65 + i),
    label: generateDescriptiveLabel()
}));

const speakerIds = speakers.map(s => s.id);


const generateTranscript = (): TranscriptEntry[] => {
    const entries: TranscriptEntry[] = [];
    const sentiments: ('Positive' | 'Negative' | 'Neutral')[] = ['Positive', 'Negative', 'Neutral'];
    const emotions = ['optimistic', 'critical', 'calm', 'appreciative', 'frustrated', 'curious', 'supportive'];
    let currentTime = 0;
    let id = 1;

    // In a 14 second clip with 16 people, only a few will talk.
    const numberOfUtterances = getRandomInt(4, 7);
    const speakingOrder = Array.from({ length: numberOfUtterances }, () => getRandomElement(speakerIds));

    for (const speakerId of speakingOrder) {
        const duration = getRandomInt(1, 3);
        if (currentTime + duration > MEETING_DURATION_SECONDS) break;

        currentTime += duration;
        const sentiment = getRandomElement(sentiments);
        entries.push({
            id: id++,
            speaker: speakerId,
            label: speakers.find(s => s.id === speakerId)!.label,
            text: `This is a short statement from speaker ${speakerId}.`,
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

    speakers.forEach((speaker) => {
        let speakingTime = 0;
        if (speakersWhoSpoke.includes(speaker.id)) {
             const utterances = transcript.filter(t => t.speaker === speaker.id);
             speakingTime = utterances.length * getRandomInt(1,3); // Approximate time
             speakingTime = Math.max(1, Math.min(speakingTime, remainingTime));
        }
        
        remainingTime -= speakingTime;
        if(remainingTime < 0) remainingTime = 0;

        const sentimentValues = transcript.filter(t => t.speaker === speaker.id).map(t => t.sentiment);
        let overallSentiment: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';
        if (sentimentValues.length > 0) {
            const pos = sentimentValues.filter(s => s === 'Positive').length;
            const neg = sentimentValues.filter(s => s === 'Negative').length;
            if (pos > neg) overallSentiment = 'Positive';
            else if (neg > pos) overallSentiment = 'Negative';
        }

        metrics.push({
            speaker: speaker.id,
            label: speaker.label,
            speakingTime: `${speakingTime} sec`,
            conflict: getRandomInt(5, 40),
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
        speakerIds.forEach(id => {
            if (speakersWhoSpoke.includes(id)) {
                point[id] = Math.random() * 1.8 - 0.9; // Fluctuate sentiment
            } else {
                point[id] = 0; // No sentiment if didn't speak
            }
        });
        timeline.push(point);
    }
    return timeline;
};

const generateRelationshipGraph = (): RelationshipGraphData => {
    const nodes = speakers.map((s, i) => ({
        id: s.id,
        label: s.label,
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
        const source = getRandomElement(speakerIds);
        let target = getRandomElement(speakerIds);
        while (source === target) {
            target = getRandomElement(speakerIds);
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
      "A participant confirms the final assets are ready for review.",
      "A speaker raises a potential conflict with another team's deployment schedule.",
      "Another participant suggests a brief follow-up to deconflict the schedules.",
    ],
    relationshipSummary: "Initial discussion shows a collaborative tone, with one participant providing support to another's concern. Most participants were listening.",
  },
  transcript,
  participation,
  emotionTimeline: generateEmotionTimeline(),
  relationshipGraph: generateRelationshipGraph(),
};
