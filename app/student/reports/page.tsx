"use client";

import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  BookOpen,
  FileText,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  Brain,
  Headphones,
  Zap,
} from "lucide-react";

const sidebarItems = [
  {
    href: "/student/dashboard",
    label: "Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    href: "/student/diagnostic",
    label: "Diagnostic Test",
    icon: <Target className="h-4 w-4" />,
  },
  {
    href: "/student/practice",
    label: "Practice",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    href: "/student/reports",
    label: "Reports",
    icon: <FileText className="h-4 w-4" />,
    active: true,
  },
];

// Mock report data
const reportData = {
  lastUpdated: "January 15, 2024",
  overallScore: 78,
  fundamentals: {
    listening: { score: 85, trend: "up", change: 5 },
    grasping: { score: 72, trend: "up", change: 3 },
    retention: { score: 68, trend: "down", change: -2 },
    application: { score: 88, trend: "up", change: 8 },
  },
  strengths: [
    "Excellent problem-solving abilities",
    "Strong listening comprehension",
    "Good analytical thinking",
  ],
  improvements: [
    "Focus on memory retention techniques",
    "Practice more complex reading passages",
    "Work on information recall strategies",
  ],
  recommendations: [
    {
      title: "Memory Enhancement Exercises",
      description: "Practice spaced repetition and memory palace techniques",
      priority: "High",
    },
    {
      title: "Advanced Reading Comprehension",
      description: "Work with more complex texts and analytical questions",
      priority: "Medium",
    },
    {
      title: "Listening Practice",
      description: "Continue with varied audio content to maintain strength",
      priority: "Low",
    },
  ],
};

const getFundamentalIcon = (type: string) => {
  switch (type) {
    case "listening":
      return <Headphones className="h-5 w-5" />;
    case "grasping":
      return <BookOpen className="h-5 w-5" />;
    case "retention":
      return <Brain className="h-5 w-5" />;
    case "application":
      return <Zap className="h-5 w-5" />;
    default:
      return <Target className="h-5 w-5" />;
  }
};

const getFundamentalColor = (type: string) => {
  switch (type) {
    case "listening":
      return "text-primary";
    case "grasping":
      return "text-secondary";
    case "retention":
      return "text-accent";
    case "application":
      return "text-primary";
    default:
      return "text-muted-foreground";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ReportsPage() {
  return (
    <AuthGuard requiredRole="student">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="student"
        userName="Ram Kumar"
      >
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Learning Report
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last updated: {reportData.lastUpdated}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground">
                {reportData.overallScore}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
          </div>

          {/* Learning Fundamentals Detailed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(reportData.fundamentals).map(([key, data]) => (
              <Card key={key} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-2 rounded-lg bg-muted/20 ${getFundamentalColor(
                        key
                      )}`}
                    >
                      {getFundamentalIcon(key)}
                    </div>
                    <div className="flex items-center gap-1">
                      {data.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          data.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {data.change > 0 ? "+" : ""}
                        {data.change}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground capitalize">
                        {key} Skills
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {data.score}%
                      </span>
                    </div>
                    <Progress value={data.score} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Strengths and Areas for Improvement */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Your Strengths
                </CardTitle>
                <CardDescription>Areas where you excel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-card-foreground">
                        {strength}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Areas for Improvement
                </CardTitle>
                <CardDescription>
                  Focus areas for better learning outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.improvements.map((improvement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-card-foreground">
                        {improvement}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personalized Recommendations */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Personalized Recommendations
              </CardTitle>
              <CardDescription>
                Tailored suggestions based on your diagnostic results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground mb-1">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {rec.description}
                      </p>
                    </div>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} Priority
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart Placeholder */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Performance Over Time
              </CardTitle>
              <CardDescription>
                Track your progress across all learning fundamentals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Performance chart will be displayed here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Integration with charting library needed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
