import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import type { SummaryData } from "@/lib/types";

interface SummaryReportProps {
  summary: SummaryData;
}

export default function SummaryReport({ summary }: SummaryReportProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                    {summary.title}
                </CardTitle>
                <CardDescription>Auto-generated analysis summary</CardDescription>
            </div>
            <Badge variant={summary.overallSentiment.includes('Negative') ? 'destructive' : 'secondary'} className="capitalize">
                {summary.overallSentiment}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Key Discussion Points</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {summary.points.map((point, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Relationship Summary</h3>
          <p className="text-sm text-muted-foreground italic">
            "{summary.relationshipSummary}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
