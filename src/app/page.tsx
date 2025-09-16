"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import UploadForm from "@/components/analysis/upload-form";
import AnalysisDashboard from "@/components/analysis/analysis-dashboard";
import type { AnalysisData, TranscriptEntry, ParticipationMetric, EmotionTimelinePoint, RelationshipGraphData } from "@/lib/types";
import Logo from "@/components/logo";
import PipelineBreakdown from "@/components/pipeline-breakdown";
import { transcribeAudio } from "@/ai/flows/automated-transcription";
import { useToast } from "@/hooks/use-toast";

type AppState = "idle" | "loading" | "results";

// Helper to generate dynamic mock data based on a real transcript
const generateDynamicAnalysis = (transcriptText: string): AnalysisData => {
  const sentences = transcriptText.split('.').filter(s => s.trim().length > 0);
  const numSpeakers = Math.min(6, sentences.length); // Limit speakers for this example
  const speakers = Array.from({ length: numSpeakers }, (_, i) => ({
      id: String.fromCharCode(65 + i),
      label: `Speaker ${String.fromCharCode(65 + i)}`,
  }));
  const speakerIds = speakers.map(s => s.id);

  let currentTime = 0;
  const transcript: TranscriptEntry[] = sentences.map((sentence, index) => {
    const duration = Math.floor(sentence.length / 15) + 1; // Approx time
    currentTime += duration;
    const speaker = speakers[index % numSpeakers];
    return {
      id: index + 1,
      speaker: speaker.id,
      label: speaker.label,
      text: sentence.trim() + ".",
      sentiment: ['Positive', 'Negative', 'Neutral'][Math.floor(Math.random() * 3)] as 'Positive' | 'Negative' | 'Neutral',
      emotion: ['curious', 'supportive', 'critical'][Math.floor(Math.random() * 3)],
      timestamp: `00:${currentTime.toString().padStart(2, '0')}`,
    };
  });

  const participation: ParticipationMetric[] = speakers.map(speaker => {
    const utterances = transcript.filter(t => t.speaker === speaker.id);
    const speakingTime = utterances.reduce((acc, u) => acc + Math.floor(u.text.length / 15) + 1, 0);
    return {
      speaker: speaker.id,
      label: speaker.label,
      speakingTime: `${speakingTime} sec`,
      conflict: Math.floor(Math.random() * 20),
      sentiment: ['Positive', 'Negative', 'Neutral'][Math.floor(Math.random() * 3)] as 'Positive' | 'Negative' | 'Neutral',
    };
  });
  
  const emotionTimeline: EmotionTimelinePoint[] = Array.from({length: 5}, (_, i) => {
      const time = Math.floor(i * (currentTime / 4));
      const point: EmotionTimelinePoint = { time: `0:${time.toString().padStart(2, '0')}` };
      speakerIds.forEach(id => {
          point[id] = Math.random() * 2 - 1;
      });
      return point;
  });

  const relationshipGraph: RelationshipGraphData = {
    nodes: speakers.map((s, i) => ({ id: s.id, label: s.label, group: i + 1 })),
    links: Array.from({length: numSpeakers}, (_, i) => ({
      source: speakers[i].id,
      target: speakers[(i + 1) % numSpeakers].id,
      type: ['support', 'conflict', 'neutral'][Math.floor(Math.random() * 3)] as 'support' | 'conflict' | 'neutral',
      value: Math.floor(Math.random() * 3) + 1,
    })),
  };

  return {
    summary: {
      title: "Dynamic Analysis Report",
      overallSentiment: "Mixed",
      points: transcript.slice(0, 4).map(t => t.text),
      relationshipSummary: "This is a dynamically generated relationship summary based on the transcribed text."
    },
    transcript,
    participation,
    emotionTimeline,
    relationshipGraph,
  };
}


export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setAppState("loading");
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const audioDataUri = reader.result as string;
        
        // Call the transcription flow
        const transcriptionResult = await transcribeAudio({ audioDataUri });
        const transcriptText = transcriptionResult.transcript;

        if (!transcriptText || transcriptText.trim().length === 0) {
          throw new Error("Transcription failed or returned empty.");
        }

        // Generate the rest of the analysis dynamically based on the transcript
        const dynamicData = generateDynamicAnalysis(transcriptText);
        setAnalysisData(dynamicData);
        setAppState("results");
      };
      reader.onerror = (error) => {
        console.error("FileReader error: ", error);
        throw new Error("Failed to read the file.");
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Something went wrong during the analysis. Please try again.",
      });
      setAppState("idle");
    }
  };

  const handleNewAnalysis = () => {
    setAppState("idle");
    setAnalysisData(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-16 flex items-center justify-between">
          <Logo />
          {appState === "results" && (
            <button
              onClick={handleNewAnalysis}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            >
              New Analysis
            </button>
          )}
        </div>
      </header>
      <main className="flex-1 container py-8 md:py-12">
        {appState === "idle" && (
          <div className="space-y-12">
            <UploadForm onFileUpload={handleFileUpload} />
            <PipelineBreakdown />
          </div>
        )}
        {appState === "loading" && (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
            <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Analyzing Meeting...
            </h2>
            <p className="text-muted-foreground max-w-md">
              Our AI is transcribing, identifying speakers, analyzing sentiment, and mapping relationships. This may take a moment.
            </p>
          </div>
        )}
        {appState === "results" && analysisData && (
          <AnalysisDashboard data={analysisData} />
        )}
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with{" "}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Next.js
            </a>{" "}
            and{" "}
            <a
              href="https://firebase.google.com/docs/genkit"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Genkit
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
