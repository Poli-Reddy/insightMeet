import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TranscriptEntry } from "@/lib/types";

interface TranscriptViewProps {
  transcript: TranscriptEntry[];
}

const sentimentColorMap = {
  Positive: "bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30",
  Negative: "bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-500/30",
  Neutral: "bg-gray-500/20 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 border-gray-500/30",
};

const speakerColorMap: { [key: string]: string } = {
    'A': 'bg-sky-200 text-sky-800 dark:bg-sky-800 dark:text-sky-200',
    'B': 'bg-rose-200 text-rose-800 dark:bg-rose-800 dark:text-rose-200',
    'C': 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200',
}

export default function TranscriptView({ transcript }: TranscriptViewProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Full Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="space-y-6">
            {transcript.map((entry) => (
              <div key={entry.id} className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border">
                    <AvatarFallback className={`${speakerColorMap[entry.speaker] || 'bg-muted'} font-bold`}>
                        {entry.speaker}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-foreground">{entry.label}</p>
                    <time className="text-xs text-muted-foreground">{entry.timestamp}</time>
                  </div>
                  <p className="text-muted-foreground mb-2">{entry.text}</p>
                  <Badge variant="outline" className={`${sentimentColorMap[entry.sentiment]} capitalize`}>
                    {entry.emotion}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
