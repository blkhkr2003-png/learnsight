"use client";

import AuthGuard from "@/components/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Heart,
  MessageCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  BookOpen,
  Brain,
  Clock,
  Zap,
  Star,
} from "lucide-react";

const sidebarItems = [
  {
    href: "/parent/dashboard",
    label: "Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    active: true,
  },
  {
    href: "/parent/progress",
    label: "Progress",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    href: "/parent/support",
    label: "Support Tips",
    icon: <Heart className="h-4 w-4" />,
  },
];

// Mock parent data
const parentData = {
  parentName: "Mr. Rajesh Kumar",
  childName: "Ram Kumar",
  childGrade: "Grade 10",
  teacher: "Ms. Sarah Johnson",
  lastUpdated: "January 15, 2024",
  overallProgress: 78,
  practiceStreak: 5,
  weeklyGoal: 80,
  fundamentals: {
    listening: { score: 85, trend: "up", change: 5 },
    grasping: { score: 72, trend: "up", change: 3 },
    retention: { score: 68, trend: "down", change: -2 },
    application: { score: 88, trend: "up", change: 8 },
  },
  recentActivity: [
    {
      date: "Jan 15",
      activity: "Completed Listening Exercise",
      score: 92,
      type: "practice",
    },
    {
      date: "Jan 14",
      activity: "Took Diagnostic Test",
      score: 78,
      type: "diagnostic",
    },
    {
      date: "Jan 13",
      activity: "Math Problem Solving",
      score: 85,
      type: "practice",
    },
  ],
  strengths: [
    "Excellent problem-solving skills",
    "Strong listening comprehension",
  ],
  improvements: [
    "Memory retention techniques",
    "Reading comprehension practice",
  ],
  recommendations: [
    {
      title: "Encourage Daily Reading",
      description:
        "15-20 minutes of reading daily can improve comprehension and retention",
      priority: "High",
    },
    {
      title: "Memory Games",
      description: "Play memory-based games to strengthen retention skills",
      priority: "Medium",
    },
    {
      title: "Celebrate Progress",
      description:
        "Acknowledge improvements in listening and application skills",
      priority: "Low",
    },
  ],
  upcomingGoals: [
    "Improve retention score to 75%",
    "Maintain listening skills above 80%",
    "Complete 5 practice sessions this week",
  ],
};

const getFundamentalIcon = (type: string) => {
  switch (type) {
    case "listening":
      return <BookOpen className="h-4 w-4" />;
    case "grasping":
      return <Brain className="h-4 w-4" />;
    case "retention":
      return <Clock className="h-4 w-4" />;
    case "application":
      return <Zap className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
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

const getActivityIcon = (type: string) => {
  switch (type) {
    case "diagnostic":
      return <Target className="h-4 w-4 text-primary" />;
    case "practice":
      return <BookOpen className="h-4 w-4 text-secondary" />;
    default:
      return <Star className="h-4 w-4" />;
  }
};

export default function ParentDashboard() {
  return (
    <AuthGuard requiredRole="parent">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="parent"
        userName={parentData.parentName}
      >
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {parentData.childName}&apos;s Learning Journey
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last updated: {parentData.lastUpdated} • {parentData.childGrade}{" "}
                • Teacher: {parentData.teacher}
              </p>
            </div>
            <Button>
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Teacher
            </Button>
          </div>

          {/* Quick Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Overall Progress
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {parentData.overallProgress}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <Progress value={parentData.overallProgress} className="mt-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  Goal: {parentData.weeklyGoal}% this week
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Practice Streak
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {parentData.practiceStreak} days
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-secondary" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Keep up the great work!
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      This Week
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">3</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-accent" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Practice sessions completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Learning Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Learning Skills Progress
                  </CardTitle>
                  <CardDescription>
                    How {parentData.childName} is performing in key areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(parentData.fundamentals).map(
                      ([key, data]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-1 rounded ${getFundamentalColor(
                                  key
                                )}`}
                              >
                                {getFundamentalIcon(key)}
                              </div>
                              <span className="text-sm font-medium text-card-foreground capitalize">
                                {key === "grasping" ? "Comprehension" : key}{" "}
                                Skills
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {data.trend === "up" ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {data.score}%
                              </span>
                            </div>
                          </div>
                          <Progress value={data.score} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {data.trend === "up" ? "Improved" : "Needs focus"}{" "}
                            by {Math.abs(data.change)}% this month
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Strengths & Areas to Improve */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Award className="h-5 w-5 text-accent" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {parentData.strengths.map((strength, index) => (
                      <div
                        key={index}
                        className="text-sm text-card-foreground p-2 bg-accent/10 rounded"
                      >
                        {strength}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Focus Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {parentData.improvements.map((improvement, index) => (
                      <div
                        key={index}
                        className="text-sm text-card-foreground p-2 bg-primary/10 rounded"
                      >
                        {improvement}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest learning sessions and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parentData.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="font-medium text-card-foreground">
                          {activity.activity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.date}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{activity.score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support Recommendations */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                How You Can Help
              </CardTitle>
              <CardDescription>
                Personalized suggestions to support {parentData.childName}&apos;s
                learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parentData.recommendations.map((rec, index) => (
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
                      {rec.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Goals */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Upcoming Goals
              </CardTitle>
              <CardDescription>
                What {parentData.childName} is working towards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parentData.upcomingGoals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <Target className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-card-foreground">{goal}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Encouragement Message */}
          <Card className="border-border bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">
                    Keep Encouraging!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {parentData.childName} is making great progress in their
                    learning journey. Your support and encouragement play a
                    crucial role in their success. Continue celebrating their
                    achievements and helping them work through challenges.
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
