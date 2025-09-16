"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmotionTimelinePoint, ParticipationMetric } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface EmotionTimelineProps {
  data: EmotionTimelinePoint[];
  speakers: ParticipationMetric[];
}

const speakerChartColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function EmotionTimeline({ data, speakers }: EmotionTimelineProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Emotion Timeline</CardTitle>
        <CardDescription>Sentiment fluctuation per speaker over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: -20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis domain={[-1, 1]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <line y1="0" y2="0" stroke="hsl(var(--border))" strokeDasharray="5 5" />
            {speakers.map((speaker, index) => (
              <Line
                key={speaker.speaker}
                type="monotone"
                dataKey={speaker.speaker}
                name={speaker.label}
                stroke={speakerChartColors[index % speakerChartColors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
