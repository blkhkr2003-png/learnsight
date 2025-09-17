"use client";

import { AuthGuard } from "@/components/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
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
  Brain,
  CheckCircle,
  Clock,
  FileText,
  Play,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

const sidebarItems = [
  {
    href: "/student/dashboard",
    label: "Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    active: true,
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
  },
];

// Mock data for demo
const studentData = {
  name: "Ram Kumar",
  lastDiagnostic: "2024-01-15",
  overallProgress: 78,
  practiceStreak: 5,
  completedPractices: 23,
  totalPractices: 30,
  fundamentals: {
    listening: 85,
    grasping: 72,
    retention: 68,
    application: 88,
  },
  recentPractices: [
    {
      id: 1,
      title: "Reading Comprehension - Science",
      completed: true,
      score: 92,
    },
    { id: 2, title: "Math Problem Solving", completed: true, score: 78 },
    {
      id: 3,
      title: "Listening Exercise - History",
      completed: false,
      score: null,
    },
  ],
  recommendations: [
    "Focus on retention exercises to improve memory skills",
    "Practice more listening comprehension activities",
    "Great progress in application skills - keep it up!",
  ],
};

export default function StudentDashboard() {
  return (
    <AuthGuard requiredRole="student">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="student"
        userName={studentData.name}
      >
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {studentData.name}!
            </h1>
            <p className="text-muted-foreground">
              Ready to continue your learning journey? Let's see how you're
              progressing.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Overall Progress
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {studentData.overallProgress}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <Progress
                  value={studentData.overallProgress}
                  className="mt-3"
                />
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
                      {studentData.practiceStreak} days
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {studentData.completedPractices}/
                      {studentData.totalPractices}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Last Diagnostic
                    </p>
                    <p className="text-sm font-bold text-card-foreground">
                      Jan 15, 2024
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <Button size="sm" className="mt-2 w-full" asChild>
                  <Link href="/student/diagnostic">Take New Test</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Learning Fundamentals */}
            <div className="lg:col-span-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Learning Fundamentals
                  </CardTitle>
                  <CardDescription>
                    Your performance across key learning areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground">
                          Listening Skills
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {studentData.fundamentals.listening}%
                        </span>
                      </div>
                      <Progress
                        value={studentData.fundamentals.listening}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground">
                          Grasping Power
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {studentData.fundamentals.grasping}%
                        </span>
                      </div>
                      <Progress
                        value={studentData.fundamentals.grasping}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground">
                          Retention Power
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {studentData.fundamentals.retention}%
                        </span>
                      </div>
                      <Progress
                        value={studentData.fundamentals.retention}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground">
                          Practice Application
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {studentData.fundamentals.application}%
                        </span>
                      </div>
                      <Progress
                        value={studentData.fundamentals.application}
                        className="h-2"
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <Button className="w-full" asChild>
                      <Link href="/student/reports">View Detailed Report</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" asChild>
                    <Link href="/student/diagnostic">
                      <Target className="h-4 w-4 mr-2" />
                      Take Diagnostic Test
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    asChild
                  >
                    <Link href="/student/practice">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Continue Practice
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    asChild
                  >
                    <Link href="/student/reports">
                      <FileText className="h-4 w-4 mr-2" />
                      View Reports
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentData.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg"
                      >
                        {rec}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Practice */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Recent Practice
              </CardTitle>
              <CardDescription>
                Your latest practice sessions and scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentData.recentPractices.map((practice) => (
                  <div
                    key={practice.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {practice.completed ? (
                        <CheckCircle className="h-5 w-5 text-accent" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium text-card-foreground">
                          {practice.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {practice.completed ? "Completed" : "In Progress"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {practice.completed && practice.score && (
                        <Badge variant="secondary">{practice.score}%</Badge>
                      )}
                      {!practice.completed && (
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-1" />
                          Continue
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  asChild
                >
                  <Link href="/student/practice">
                    View All Practice Sessions
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
