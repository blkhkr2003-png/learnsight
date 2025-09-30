// /app/teacher/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Users,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Brain,
  BookOpen,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/contexts/user-context";
import { auth } from "@/lib/firebase";
import { TeacherDashboardData, RecentStudent, Alert } from "@/types/teacher";

const sidebarItems = [
  {
    href: "/teacher/dashboard",
    label: "Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    active: true,
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
  },
];

// Default teacher data structure
const defaultTeacherData: TeacherDashboardData = {
  name: "",
  className: "",
  totalStudents: 0,
  studentsCompleted: 0,
  averageScore: 0,
  classStats: {
    listening: 0,
    grasping: 0,
    retention: 0,
    application: 0,
  },
  recentStudents: [],
  alerts: [],
};

const getStatusColor = (status: RecentStudent["status"]) => {
  switch (status) {
    case "excellent":
      return "bg-green-100 text-green-800";
    case "active":
      return "bg-blue-100 text-blue-800";
    case "needs-attention":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: RecentStudent["status"]) => {
  switch (status) {
    case "excellent":
      return "Excellent";
    case "active":
      return "On Track";
    case "needs-attention":
      return "Needs Attention";
    default:
      return "Unknown";
  }
};

export default function TeacherDashboard() {
  const { uid } = useUser();
  const [teacherData, setTeacherData] =
    useState<TeacherDashboardData>(defaultTeacherData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeacherData() {
      if (!uid) return;
      setLoading(true);
      setError(null);
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`/api/teacher/${uid}/dashboard`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const errorMessage = err?.error || `HTTP ${res.status}`;
          const errorDetails = err?.details || "";
          setError(errorMessage + (errorDetails ? `: ${errorDetails}` : ""));
          return;
        }
        const payload = await res.json();
        // API returns { success: true, data: TeacherDashboardData }
        setTeacherData(payload.data as TeacherDashboardData);
      } catch (error) {
        console.error("Error fetching teacher dashboard data:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTeacherData();
  }, [uid]);

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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
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
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">
                Error Loading Dashboard
              </h2>
              <p className="text-muted-foreground mb-2">{error}</p>
              <div className="bg-gray-100 p-4 rounded-md mb-6 text-sm">
                <p className="font-mono text-xs break-all">{error}</p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="teacher">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="teacher"
        userName={teacherData.name}
      >
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {teacherData.name}!
            </h1>
            <p className="text-muted-foreground">
              {teacherData.className} • {teacherData.totalStudents} students
            </p>

            {/* Teacher ID Card */}
            <Card className="mt-4 border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-card-foreground text-lg">
                  Your Teacher ID
                </CardTitle>
                <CardDescription>
                  Share this ID with your students so they can connect to your
                  account
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="bg-muted p-3 rounded-md flex-1 mr-3">
                    <code className="text-sm font-mono break-all">{uid}</code>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(uid || "")}
                  >
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Students
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {teacherData.totalStudents}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Completed Tests
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {teacherData.studentsCompleted}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                <Progress
                  value={
                    (teacherData.studentsCompleted /
                      teacherData.totalStudents) *
                    100
                  }
                  className="mt-3"
                />
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Class Average
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {teacherData.averageScore}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Need Attention
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {
                        teacherData.recentStudents.filter(
                          (s) => s.status === "needs-attention"
                        ).length
                      }
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {teacherData.alerts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Alerts & Notifications
              </h2>
              <div className="space-y-3">
                {teacherData.alerts.map((alert: Alert, index: number) => (
                  <Card key={index} className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {alert.type === "warning" ? (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                          <span className="text-card-foreground">
                            {alert.message}
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          {alert.action}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Class Performance Overview */}
            <div className="lg:col-span-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Class Performance Overview
                  </CardTitle>
                  <CardDescription>
                    Average scores across learning fundamentals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          Listening Skills
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {teacherData.classStats.listening}%
                        </span>
                      </div>
                      <Progress
                        value={teacherData.classStats.listening}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground flex items-center gap-2">
                          <Brain className="h-4 w-4 text-secondary" />
                          Grasping Power
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {teacherData.classStats.grasping}%
                        </span>
                      </div>
                      <Progress
                        value={teacherData.classStats.grasping}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4 text-accent" />
                          Retention Power
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {teacherData.classStats.retention}%
                        </span>
                      </div>
                      <Progress
                        value={teacherData.classStats.retention}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          Practice Application
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {teacherData.classStats.application}%
                        </span>
                      </div>
                      <Progress
                        value={teacherData.classStats.application}
                        className="h-2"
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <Button className="w-full" asChild>
                      <Link href="/teacher/reports">
                        View Detailed Class Report
                      </Link>
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
                    <Link href="/teacher/students">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Students
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    asChild
                  >
                    <Link href="/teacher/reports">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Reports
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Class Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const stats = teacherData.classStats;
                      const entries = Object.entries(stats);
                      const strongest = entries.reduce(
                        (max, [key, value]) =>
                          value > max.value ? { key, value } : max,
                        { key: "", value: 0 }
                      );
                      const weakest = entries.reduce(
                        (min, [key, value]) =>
                          value < min.value ? { key, value } : min,
                        { key: "", value: 100 }
                      );

                      const skillNames = {
                        listening: "Listening Skills",
                        grasping: "Grasping Power",
                        retention: "Retention Power",
                        application: "Practice Application",
                      };

                      return (
                        <>
                          <div className="text-sm">
                            <p className="font-medium text-card-foreground mb-1">
                              Strongest Area
                            </p>
                            <p className="text-muted-foreground">
                              {
                                skillNames[
                                  strongest.key as keyof typeof skillNames
                                ]
                              }{" "}
                              ({strongest.value}%)
                            </p>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-card-foreground mb-1">
                              Needs Focus
                            </p>
                            <p className="text-muted-foreground">
                              {
                                skillNames[
                                  weakest.key as keyof typeof skillNames
                                ]
                              }{" "}
                              ({weakest.value}%)
                            </p>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-card-foreground mb-1">
                              Completion Rate
                            </p>
                            <p className="text-muted-foreground">
                              {Math.round(
                                (teacherData.studentsCompleted /
                                  teacherData.totalStudents) *
                                  100
                              )}
                              % of students
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Student Activity */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">
                  Recent Student Activity
                </CardTitle>
                <CardDescription>
                  Latest diagnostic results and progress updates
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/teacher/students">View All Students</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Last Diagnostic</TableHead>
                    <TableHead>Weakest Skill</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherData.recentStudents.map((student: RecentStudent) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.lastDiagnostic}</TableCell>
                      <TableCell>{student.weakestSkill}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={student.progress}
                            className="w-16 h-2"
                          />
                          <span className="text-sm text-muted-foreground">
                            {student.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(student.status)}>
                          {getStatusLabel(student.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
