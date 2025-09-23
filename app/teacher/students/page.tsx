"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Search,
  Filter,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Mail,
  Calendar,
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
    active: true,
  },
  {
    href: "/teacher/reports",
    label: "Reports",
    icon: <FileText className="h-4 w-4" />,
  },
];

// Mock student data
const studentsData = [
  {
    id: 1,
    name: "Ram Kumar",
    email: "ram@school.edu",
    lastDiagnostic: "2024-01-15",
    diagnosticCount: 3,
    weakestSkill: "Retention",
    strongestSkill: "Application",
    overallProgress: 78,
    fundamentals: {
      listening: 85,
      grasping: 72,
      retention: 68,
      application: 88,
    },
    trend: "up",
    status: "active",
    practiceStreak: 5,
  },
  {
    id: 2,
    name: "Shyam Patel",
    email: "shyam@school.edu",
    lastDiagnostic: "2024-01-14",
    diagnosticCount: 2,
    weakestSkill: "Listening",
    strongestSkill: "Grasping",
    overallProgress: 65,
    fundamentals: {
      listening: 58,
      grasping: 75,
      retention: 62,
      application: 65,
    },
    trend: "down",
    status: "needs-attention",
    practiceStreak: 2,
  },
  {
    id: 3,
    name: "Sanga Sharma",
    email: "sanga@school.edu",
    lastDiagnostic: "2024-01-13",
    diagnosticCount: 4,
    weakestSkill: "Application",
    strongestSkill: "Listening",
    overallProgress: 89,
    fundamentals: {
      listening: 92,
      grasping: 88,
      retention: 85,
      application: 91,
    },
    trend: "up",
    status: "excellent",
    practiceStreak: 12,
  },
  {
    id: 4,
    name: "Priya Singh",
    email: "priya@school.edu",
    lastDiagnostic: "2024-01-12",
    diagnosticCount: 3,
    weakestSkill: "Grasping",
    strongestSkill: "Retention",
    overallProgress: 72,
    fundamentals: {
      listening: 75,
      grasping: 68,
      retention: 78,
      application: 70,
    },
    trend: "up",
    status: "active",
    practiceStreak: 7,
  },
  {
    id: 5,
    name: "Arjun Thapa",
    email: "arjun@school.edu",
    lastDiagnostic: "2024-01-11",
    diagnosticCount: 1,
    weakestSkill: "Retention",
    strongestSkill: "Application",
    overallProgress: 58,
    fundamentals: {
      listening: 62,
      grasping: 55,
      retention: 48,
      application: 67,
    },
    trend: "down",
    status: "needs-attention",
    practiceStreak: 1,
  },
];

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

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const filteredStudents = studentsData.filter((student) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                Student Management
              </h1>
              <p className="text-muted-foreground">
                Monitor and track individual student progress
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Send Reminder
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="active">On Track</SelectItem>
                    <SelectItem value="needs-attention">
                      Needs Attention
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Students Overview
              </CardTitle>
              <CardDescription>
                Detailed view of all students in your class
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Last Diagnostic</TableHead>
                    <TableHead>Tests Taken</TableHead>
                    <TableHead>Weakest Skill</TableHead>
                    <TableHead>Overall Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {student.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {student.lastDiagnostic}
                        </div>
                      </TableCell>
                      <TableCell>{student.diagnosticCount}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.weakestSkill}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={student.overallProgress}
                            className="w-16 h-2"
                          />
                          <span className="text-sm text-muted-foreground">
                            {student.overallProgress}%
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
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudent(student.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Student Detail Modal/Card */}
          {selectedStudent && (
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-card-foreground">
                    {studentsData.find((s) => s.id === selectedStudent)?.name} -
                    Detailed View
                  </CardTitle>
                  <CardDescription>
                    Comprehensive learning analytics and progress tracking
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedStudent(null)}
                >
                  Close
                </Button>
              </CardHeader>
              <CardContent>
                {(() => {
                  const student = studentsData.find(
                    (s) => s.id === selectedStudent
                  );
                  if (!student) return null;

                  return (
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-card-foreground mb-4">
                            Learning Fundamentals
                          </h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-card-foreground">
                                  Listening Skills
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {student.fundamentals.listening}%
                                </span>
                              </div>
                              <Progress
                                value={student.fundamentals.listening}
                                className="h-2"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-card-foreground">
                                  Grasping Power
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {student.fundamentals.grasping}%
                                </span>
                              </div>
                              <Progress
                                value={student.fundamentals.grasping}
                                className="h-2"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-card-foreground">
                                  Retention Power
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {student.fundamentals.retention}%
                                </span>
                              </div>
                              <Progress
                                value={student.fundamentals.retention}
                                className="h-2"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-card-foreground">
                                  Practice Application
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {student.fundamentals.application}%
                                </span>
                              </div>
                              <Progress
                                value={student.fundamentals.application}
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-card-foreground mb-4">
                            Key Metrics
                          </h4>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Overall Progress
                              </span>
                              <span className="text-sm font-medium text-card-foreground">
                                {student.overallProgress}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Practice Streak
                              </span>
                              <span className="text-sm font-medium text-card-foreground">
                                {student.practiceStreak} days
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Strongest Skill
                              </span>
                              <span className="text-sm font-medium text-card-foreground">
                                {student.strongestSkill}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Needs Focus
                              </span>
                              <span className="text-sm font-medium text-card-foreground">
                                {student.weakestSkill}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <div className="flex gap-3">
                            <Button size="sm" className="flex-1">
                              Send Message
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                            >
                              View Full Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
