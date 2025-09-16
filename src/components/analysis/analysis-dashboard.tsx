import type { AnalysisData } from "@/lib/types";
import SummaryReport from "./summary-report";
import TranscriptView from "./transcript-view";
import RelationshipGraph from "./relationship-graph";
import EmotionTimeline from "./emotion-timeline";
import ParticipationMetrics from "./participation-metrics";

interface AnalysisDashboardProps {
  data: AnalysisData;
}

export default function AnalysisDashboard({ data }: AnalysisDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 flex flex-col gap-6">
        <SummaryReport summary={data.summary} />
        <TranscriptView transcript={data.transcript} />
      </div>
      <div className="md:col-span-2 xl:col-span-1 flex flex-col gap-6">
        <RelationshipGraph data={data.relationshipGraph} />
        <EmotionTimeline data={data.emotionTimeline} speakers={data.participation} />
        <ParticipationMetrics metrics={data.participation} />
      </div>
    </div>
  );
}
