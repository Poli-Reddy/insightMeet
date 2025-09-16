"use client";

import { useState } from "react";
import { BrainCircuit, LoaderCircle } from "lucide-react";
import UploadForm from "@/components/analysis/upload-form";
import AnalysisDashboard from "@/components/analysis/analysis-dashboard";
import { mockAnalysisData } from "@/lib/mock-analysis";
import type { AnalysisData } from "@/lib/types";
import Logo from "@/components/logo";

type AppState = "idle" | "loading" | "results";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  const handleFileUpload = (file: File) => {
    console.log("File uploaded:", file.name);
    setAppState("loading");
    // Simulate AI processing delay
    setTimeout(() => {
      setAnalysisData(mockAnalysisData);
      setAppState("results");
    }, 3000);
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
        {appState === "idle" && <UploadForm onFileUpload={handleFileUpload} />}
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
