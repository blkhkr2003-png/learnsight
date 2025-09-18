"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, TrendingUp } from "lucide-react";

interface PracticeCardProps {
  id: string;
  title: string;
  description: string;
  fundamental: "Listening" | "Grasping" | "Retention" | "Application";
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: number;
  points: number;
  onStart: (id: string) => void;
  className?: string;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const fundamentalColors = {
  Listening: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Grasping:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Retention:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  Application: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
};

export function PracticeCard({
  id,
  title,
  description,
  fundamental,
  difficulty,
  estimatedTime,
  points,
  onStart,
  className,
}: PracticeCardProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge
              className={fundamentalColors[fundamental]}
              variant="secondary"
            >
              {fundamental}
            </Badge>
            <Badge className={difficultyColors[difficulty]} variant="secondary">
              {difficulty}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{points} pts</span>
            </div>
          </div>
          <Button
            onClick={() => onStart(id)}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Start Practice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
