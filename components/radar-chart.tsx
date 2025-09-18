"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface RadarChartData {
  fundamental: string;
  score: number;
  fullMark: number;
}

interface RadarChartProps {
  data: RadarChartData[];
  className?: string;
}

export function RadarChartComponent({ data, className }: RadarChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey="fundamental"
            className="text-sm fill-muted-foreground"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            className="text-xs fill-muted-foreground"
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
