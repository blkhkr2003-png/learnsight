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

// Mock teacher data
const teacherData = {
  name: "Ms. Sarah Johnson",
  className: "Grade 10 - Section A",
  totalStudents: 28,
  studentsCompleted: 25,
  averageScore: 76,
  classStats: {
    listening: 78,
    grasping: 74,
    retention: 71,
    application: 82,
  },
  recentStudents: [
    {
      id: 1,
      name: "Ram Kumar",
      lastDiagnostic: "2024-01-15",
      weakestSkill: "Retention",
      progress: 78,
      trend: "up",
      status: "active",
    },
    {
      id: 2,
      name: "Shyam Patel",
      lastDiagnostic: "2024-01-14",
      weakestSkill: "Listening",
      progress: 65,
      trend: "down",
      status: "needs-attention",
    },
    {
      id: 3,
      name: "Sanga Sharma",
      lastDiagnostic: "2024-01-13",
      weakestSkill: "Application",
      progress: 89,
      trend: "up",
      status: "excellent",
    },
    {
      id: 4,
      name: "Priya Singh",
      lastDiagnostic: "2024-01-12",
      weakestSkill: "Grasping",
      progress: 72,
      trend: "up",
      status: "active",
    },
    {
      id: 5,
      name: "Arjun Thapa",
      lastDiagnostic: "2024-01-11",
      weakestSkill: "Retention",
      progress: 58,
      trend: "down",
      status: "needs-attention",
    },
  ],
  alerts: [
    {
      type: "warning",
      message: "3 students haven't taken diagnostic test this week",
      action: "Send reminder",
    },
    {
      type: "info",
      message: "Class average improved by 5% this month",
      action: "View details",
    },
  ],
};

const getStatusColor = (status: string) => {
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

const getStatusLabel = (status: string) => {
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
                    <p className="text-2xl font-bold text-card-foreground">2</p>
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
                {teacherData.alerts.map((alert, index) => (
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
                    <div className="text-sm">
                      <p className="font-medium text-card-foreground mb-1">
                        Strongest Area
                      </p>
                      <p className="text-muted-foreground">
                        Practice Application (82%)
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-card-foreground mb-1">
                        Needs Focus
                      </p>
                      <p className="text-muted-foreground">
                        Retention Power (71%)
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-card-foreground mb-1">
                        Improvement
                      </p>
                      <p className="text-muted-foreground">
                        +5% from last month
                      </p>
                    </div>
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
                  {teacherData.recentStudents.map((student) => (
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
