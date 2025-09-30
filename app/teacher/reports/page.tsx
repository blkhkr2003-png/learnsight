"use client";

import { useState, useEffect } from "react";
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
  RefreshCw,
} from "lucide-react";
import { getTeacherDashboardData } from "@/lib/teacher-service";
import { TeacherDashboardData } from "@/types/teacher";
import { auth } from "@/lib/firebase";

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

// Generate insights based on class performance data
const generateInsights = (classStats: { [key: string]: number }, averageScore: number) => {
  const insights = [];

  // Find strongest and weakest skills
  const skills = Object.entries(classStats) as [string, number][];
  const strongest = skills.reduce(
    (max, [skill, value]) => (value > max.value ? { skill, value } : max),
    { skill: "", value: 0 }
  );
  const weakest = skills.reduce(
    (min, [skill, value]) => (value < min.value ? { skill, value } : min),
    { skill: "", value: 100 }
  );

  // Add strength insight
  insights.push({
    type: "strength",
    title: `Strong ${formatSkillName(strongest.skill)}`,
    description: `Class excels in ${formatSkillName(
      strongest.skill
    ).toLowerCase()} with ${strongest.value}% average`,
  });

  // Add improvement insight for weakest skill if below 75%
  if (weakest.value < 75) {
    insights.push({
      type: "improvement",
      title: `Focus on ${formatSkillName(weakest.skill)}`,
      description: `${formatSkillName(weakest.skill)} needs attention with ${
        weakest.value
      }% average`,
    });
  }

  // Add overall performance insight
  insights.push({
    type: "trend",
    title: "Class Performance",
    description:
      averageScore >= 80
        ? "Class is performing excellently overall"
        : averageScore >= 70
        ? "Class is performing well with room for improvement"
        : "Class needs additional support to improve performance",
  });

  return insights;
};

// Format skill name for display
const formatSkillName = (skill: string) => {
  switch (skill) {
    case "listening":
      return "Listening Skills";
    case "grasping":
      return "Grasping Power";
    case "retention":
      return "Retention Power";
    case "application":
      return "Practice Application";
    default:
      return skill;
  }
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
  const [reportData, setReportData] = useState<TeacherDashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if auth is initialized
        if (!auth) {
          throw new Error("Firebase auth not initialized");
        }

        // Wait for authentication state to be determined
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (!user) {
            setError("User not authenticated");
            setLoading(false);
            return;
          }

          try {
            const data = await getTeacherDashboardData(user.uid);
            setReportData(data);
          } catch (err) {
            console.error("Error fetching report data:", err);
            setError(
              err instanceof Error ? err.message : "Failed to fetch report data"
            );
          } finally {
            setLoading(false);
          }
        });

        // Cleanup the listener when component unmounts
        return unsubscribe;
      } catch (err) {
        console.error("Authentication error:", err);
        setError(err instanceof Error ? err.message : "Authentication error");
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // Calculate student distribution from recent students
  const calculateStudentDistribution = () => {
    if (!reportData || !reportData.recentStudents) {
      return { excellent: 0, onTrack: 0, needsAttention: 0 };
    }

    return reportData.recentStudents.reduce(
      (acc, student) => {
        if (student.status === "excellent") acc.excellent++;
        else if (student.status === "active") acc.onTrack++;
        else if (student.status === "needs-attention") acc.needsAttention++;
        return acc;
      },
      { excellent: 0, onTrack: 0, needsAttention: 0 }
    );
  };

  // Get top performers from recent students
  const getTopPerformers = () => {
    if (!reportData || !reportData.recentStudents) return [];

    return [...reportData.recentStudents]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3)
      .map((student) => ({
        name: student.name,
        score: student.progress,
        improvement: Math.floor(Math.random() * 15) + 1, // Mock improvement data
      }));
  };

  // Get students needing attention
  const getStudentsNeedingAttention = () => {
    if (!reportData || !reportData.recentStudents) return [];

    return reportData.recentStudents
      .filter((student) => student.status === "needs-attention")
      .slice(0, 3)
      .map((student) => ({
        name: student.name,
        score: student.progress,
        weakness: student.weakestSkill,
      }));
  };

  // Get current month for report period
  const getCurrentMonth = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Generate insights based on actual data
  const getInsights = () => {
    if (!reportData) return [];
    return generateInsights(reportData.classStats, reportData.averageScore);
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="teacher">
        <DashboardLayout
          sidebarItems={sidebarItems}
          userRole="teacher"
          userName="Loading..."
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading report data...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard requiredRole="teacher">
        <DashboardLayout
          sidebarItems={sidebarItems}
          userRole="teacher"
          userName="Teacher"
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Error Loading Report</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  if (!reportData) {
    return (
      <AuthGuard requiredRole="teacher">
        <DashboardLayout
          sidebarItems={sidebarItems}
          userRole="teacher"
          userName="Teacher"
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No Data Available</h2>
              <p className="text-muted-foreground">
                No report data could be found.
              </p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  const studentDistribution = calculateStudentDistribution();
  const topPerformers = getTopPerformers();
  const needsAttention = getStudentsNeedingAttention();
  const insights = getInsights();
  const reportPeriod = getCurrentMonth();

  return (
    <AuthGuard requiredRole="teacher">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="teacher"
        userName={reportData.name}
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
                {reportPeriod} • {reportData.className}
              </p>
            </div>
            <div className="flex gap-3">
              <Select defaultValue="current">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Period</SelectItem>
                  <SelectItem value="last">Last Period</SelectItem>
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
                      {reportData.averageScore}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      +{Math.floor(Math.random() * 10) + 1}%
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
                      {studentDistribution.excellent}
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
                      {studentDistribution.onTrack}
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
                      {studentDistribution.needsAttention}
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
                        {reportData.classStats.listening}%
                      </span>
                    </div>
                    <Progress
                      value={reportData.classStats.listening}
                      className="h-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground">
                        Grasping Power
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {reportData.classStats.grasping}%
                      </span>
                    </div>
                    <Progress
                      value={reportData.classStats.grasping}
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
                        {reportData.classStats.retention}%
                      </span>
                    </div>
                    <Progress
                      value={reportData.classStats.retention}
                      className="h-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground">
                        Practice Application
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {reportData.classStats.application}%
                      </span>
                    </div>
                    <Progress
                      value={reportData.classStats.application}
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
                  {topPerformers.map((student, index) => (
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
                  {needsAttention.map((student, index) => (
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
                {insights.map((insight, index) => (
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
