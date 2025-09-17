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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Users,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Target,
  Award,
  AlertTriangle,
} from "lucide-react";

const sidebarItems = [
  {
    href: "/teacher/dashboard",
    label: "Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    href: "/teacher/students",
    label: "Students",
    icon: <Users className="h-4 w-4" />,
  },
  {
    href: "/teacher/reports",
    label: "Reports",
    icon: <FileText className="h-4 w-4" />,
    active: true,
  },
];

// Mock report data
const reportData = {
  classInfo: {
    name: "Grade 10 - Section A",
    teacher: "Ms. Sarah Johnson",
    totalStudents: 28,
    reportPeriod: "January 2024",
  },
  classPerformance: {
    overall: 76,
    listening: 78,
    grasping: 74,
    retention: 71,
    application: 82,
    trend: "up",
    improvement: 5,
  },
  studentDistribution: {
    excellent: 8,
    onTrack: 15,
    needsAttention: 5,
  },
  topPerformers: [
    { name: "Sanga Sharma", score: 89, improvement: 12 },
    { name: "Priya Singh", score: 85, improvement: 8 },
    { name: "Ram Kumar", score: 78, improvement: 5 },
  ],
  needsAttention: [
    { name: "Arjun Thapa", score: 58, weakness: "Retention" },
    { name: "Shyam Patel", score: 65, weakness: "Listening" },
  ],
  insights: [
    {
      type: "strength",
      title: "Strong Application Skills",
      description: "Class excels in practical problem-solving with 82% average",
    },
    {
      type: "improvement",
      title: "Focus on Retention",
      description: "Memory and recall skills need attention with 71% average",
    },
    {
      type: "trend",
      title: "Positive Growth",
      description: "Overall class performance improved by 5% this month",
    },
  ],
};

const getInsightIcon = (type: string) => {
  switch (type) {
    case "strength":
      return <Award className="h-5 w-5 text-green-600" />;
    case "improvement":
      return <Target className="h-5 w-5 text-yellow-600" />;
    case "trend":
      return <TrendingUp className="h-5 w-5 text-blue-600" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

export default function ReportsPage() {
  return (
    <AuthGuard requiredRole="teacher">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="teacher"
        userName="Ms. Sarah Johnson"
      >
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Class Reports
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {reportData.classInfo.reportPeriod} •{" "}
                {reportData.classInfo.name}
              </p>
            </div>
            <div className="flex gap-3">
              <Select defaultValue="january">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="january">January 2024</SelectItem>
                  <SelectItem value="december">December 2023</SelectItem>
                  <SelectItem value="november">November 2023</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Class Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Class Average
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {reportData.classPerformance.overall}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      +{reportData.classPerformance.improvement}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Excellent
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {reportData.studentDistribution.excellent}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      On Track
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {reportData.studentDistribution.onTrack}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Needs Attention
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {reportData.studentDistribution.needsAttention}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Breakdown */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Learning Fundamentals Performance
              </CardTitle>
              <CardDescription>
                Class average across all four key areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground">
                        Listening Skills
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {reportData.classPerformance.listening}%
                      </span>
                    </div>
                    <Progress
                      value={reportData.classPerformance.listening}
                      className="h-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground">
                        Grasping Power
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {reportData.classPerformance.grasping}%
                      </span>
                    </div>
                    <Progress
                      value={reportData.classPerformance.grasping}
                      className="h-3"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground">
                        Retention Power
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {reportData.classPerformance.retention}%
                      </span>
                    </div>
                    <Progress
                      value={reportData.classPerformance.retention}
                      className="h-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground">
                        Practice Application
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {reportData.classPerformance.application}%
                      </span>
                    </div>
                    <Progress
                      value={reportData.classPerformance.application}
                      className="h-3"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Highlights */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Students showing excellent progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.topPerformers.map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-card-foreground">
                          {student.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Overall: {student.score}%
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          +{student.improvement}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Needs Attention
                </CardTitle>
                <CardDescription>
                  Students requiring additional support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.needsAttention.map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-card-foreground">
                          {student.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Overall: {student.score}%
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-red-600 border-red-200"
                      >
                        {student.weakness}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Class Insights
              </CardTitle>
              <CardDescription>
                Key observations and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.insights.map((insight, index) => (
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

          {/* Chart Placeholder */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Performance Trends
              </CardTitle>
              <CardDescription>Class progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Performance trend chart will be displayed here
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
