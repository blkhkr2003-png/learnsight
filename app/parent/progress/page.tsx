"use client";

import AuthGuard from "@/components/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Heart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Award,
  Clock,
  BookOpen,
  Brain,
  Zap,
} from "lucide-react";

const sidebarItems = [
  {
    href: "/parent/dashboard",
    label: "Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    href: "/parent/progress",
    label: "Progress",
    icon: <TrendingUp className="h-4 w-4" />,
    active: true,
  },
  {
    href: "/parent/support",
    label: "Support Tips",
    icon: <Heart className="h-4 w-4" />,
  },
];

// Mock progress data
const progressData = {
  childName: "Ram Kumar",
  currentMonth: "January 2024",
  monthlyProgress: [
    { month: "Oct", score: 65 },
    { month: "Nov", score: 70 },
    { month: "Dec", score: 74 },
    { month: "Jan", score: 78 },
  ],
  skillProgress: {
    listening: [
      { month: "Oct", score: 75 },
      { month: "Nov", score: 78 },
      { month: "Dec", score: 82 },
      { month: "Jan", score: 85 },
    ],
    grasping: [
      { month: "Oct", score: 68 },
      { month: "Nov", score: 69 },
      { month: "Dec", score: 71 },
      { month: "Jan", score: 72 },
    ],
    retention: [
      { month: "Oct", score: 72 },
      { month: "Nov", score: 71 },
      { month: "Dec", score: 70 },
      { month: "Jan", score: 68 },
    ],
    application: [
      { month: "Oct", score: 78 },
      { month: "Nov", score: 82 },
      { month: "Dec", score: 85 },
      { month: "Jan", score: 88 },
    ],
  },
  milestones: [
    {
      date: "Jan 15, 2024",
      title: "Listening Skills Milestone",
      description: "Achieved 85% in listening comprehension",
      type: "achievement",
    },
    {
      date: "Jan 10, 2024",
      title: "5-Day Practice Streak",
      description: "Completed practice sessions for 5 consecutive days",
      type: "streak",
    },
    {
      date: "Dec 28, 2023",
      title: "Problem Solving Improvement",
      description: "Application skills improved by 10% this month",
      type: "improvement",
    },
  ],
  insights: [
    {
      type: "positive",
      title: "Consistent Growth",
      description:
        "Overall performance has improved steadily over the past 4 months",
    },
    {
      type: "attention",
      title: "Retention Focus Needed",
      description: "Memory skills have declined slightly and need attention",
    },
    {
      type: "strength",
      title: "Excellent Application Skills",
      description:
        "Problem-solving abilities are the strongest area with 88% score",
    },
  ],
};

const getInsightIcon = (type: string) => {
  switch (type) {
    case "positive":
      return <TrendingUp className="h-5 w-5 text-green-600" />;
    case "attention":
      return <Target className="h-5 w-5 text-yellow-600" />;
    case "strength":
      return <Award className="h-5 w-5 text-blue-600" />;
    default:
      return <BarChart3 className="h-5 w-5" />;
  }
};

const getMilestoneIcon = (type: string) => {
  switch (type) {
    case "achievement":
      return <Award className="h-4 w-4 text-green-600" />;
    case "streak":
      return <Clock className="h-4 w-4 text-blue-600" />;
    case "improvement":
      return <TrendingUp className="h-4 w-4 text-purple-600" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

const getSkillIcon = (skill: string) => {
  switch (skill) {
    case "listening":
      return <BookOpen className="h-4 w-4 text-primary" />;
    case "grasping":
      return <Brain className="h-4 w-4 text-secondary" />;
    case "retention":
      return <Clock className="h-4 w-4 text-accent" />;
    case "application":
      return <Zap className="h-4 w-4 text-primary" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

export default function ProgressPage() {
  return (
    <AuthGuard requiredRole="parent">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="parent"
        userName="Mr. Rajesh Kumar"
      >
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {progressData.childName}&apos;s Progress Report
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Detailed progress tracking for {progressData.currentMonth}
            </p>
          </div>

          {/* Overall Progress Chart */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Overall Progress Trend
              </CardTitle>
              <CardDescription>
                Monthly performance over the last 4 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.monthlyProgress.map((month, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium text-muted-foreground">
                      {month.month}
                    </div>
                    <div className="flex-1">
                      <Progress value={month.score} className="h-3" />
                    </div>
                    <div className="w-12 text-sm font-medium text-card-foreground">
                      {month.score}%
                    </div>
                    {index > 0 && (
                      <div className="w-16 flex items-center justify-end">
                        {month.score >
                        progressData.monthlyProgress[index - 1].score ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            <span className="text-xs">
                              +
                              {month.score -
                                progressData.monthlyProgress[index - 1].score}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <TrendingDown className="h-3 w-3" />
                            <span className="text-xs">
                              {month.score -
                                progressData.monthlyProgress[index - 1].score}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skills Breakdown */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Skills Progress Breakdown
              </CardTitle>
              <CardDescription>
                Individual skill development over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {Object.entries(progressData.skillProgress).map(
                  ([skill, data]) => (
                    <div key={skill} className="space-y-4">
                      <div className="flex items-center gap-2">
                        {getSkillIcon(skill)}
                        <h4 className="font-semibold text-card-foreground capitalize">
                          {skill === "grasping" ? "Comprehension" : skill}{" "}
                          Skills
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {data.map((month, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="w-10 text-xs text-muted-foreground">
                              {month.month}
                            </div>
                            <div className="flex-1">
                              <Progress value={month.score} className="h-2" />
                            </div>
                            <div className="w-10 text-xs text-card-foreground">
                              {month.score}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Recent Milestones
              </CardTitle>
              <CardDescription>
                Key achievements and progress markers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border border-border rounded-lg"
                  >
                    <div className="p-2 bg-muted/20 rounded-full">
                      {getMilestoneIcon(milestone.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-card-foreground">
                          {milestone.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {milestone.date}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress Insights */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Progress Insights
              </CardTitle>
              <CardDescription>
                Key observations about {progressData.childName}&apos;s learning
                journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border border-border rounded-lg"
                  >
                    {getInsightIcon(insight.type)}
                    <div>
                      <h4 className="font-medium text-card-foreground mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                4-Month Summary
              </CardTitle>
              <CardDescription>
                Overall performance changes from October to January
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    +13%
                  </div>
                  <div className="text-sm text-green-600">
                    Overall Improvement
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700 mb-1">
                    +10%
                  </div>
                  <div className="text-sm text-blue-600">Listening Skills</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700 mb-1">
                    +10%
                  </div>
                  <div className="text-sm text-purple-600">
                    Application Skills
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700 mb-1">
                    -4%
                  </div>
                  <div className="text-sm text-yellow-600">
                    Retention (Needs Focus)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
