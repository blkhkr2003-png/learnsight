"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { auth } from "@/lib/firebase";
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

// Student data is now fetched from the API

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
  const { uid, user, loading: authLoading } = useUser();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!uid) {
        console.log("No UID available, skipping fetch");
        return;
      }

      try {
        console.log("Fetching students for teacher ID:", uid);
        setLoading(true);

        // Check if we have a valid Firebase auth user
        const { auth } = await import("@/lib/firebase");
        if (!auth.currentUser) {
          console.error("No authenticated user found");
          setError("You must be logged in to view students");
          return;
        }

        console.log("Current user UID:", auth.currentUser.uid);
        console.log("Teacher UID from context:", uid);

        // Get the current user's ID token for API authentication
        const idToken = await auth.currentUser!.getIdToken();

        // Fetch students from the API
        const response = await fetch(`/api/teacher/${uid}/students`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("Students data received:", data);

        if (data.success && data.students) {
          setStudents(data.students);
          console.log("Students state updated");
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        console.error("Error type:", typeof err);
        console.error("Error details:", JSON.stringify(err, null, 2));

        let errorMessage = "An error occurred while fetching students";
        if (err instanceof Error) {
          errorMessage += ": " + err.message;
          console.error("Error stack:", err.stack);
        } else {
          errorMessage += ": " + String(err);
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [uid]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading || authLoading) {
    return (
      <AuthGuard requiredRole="teacher">
        <DashboardLayout
          sidebarItems={sidebarItems}
          userRole="teacher"
          userName={user?.displayName || "Loading..."} // ✅
        >
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading students...</p>
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
          userName={user?.displayName || "Loading..."}
        >
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
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
        userName={user?.displayName || "Loading..."}
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
              <Button
                onClick={async () => {
                  // This would open a modal to add a new student
                  const studentId = prompt("Enter student ID to assign:");
                  if (studentId && uid) {
                    try {
                      // Get the current user's ID token for API authentication
                      const { auth } = await import("@/lib/firebase");
                      const idToken = await auth.currentUser!.getIdToken();

                      // Call the API to assign the student
                      const response = await fetch(
                        `/api/teacher/${uid}/students`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${idToken}`,
                          },
                          body: JSON.stringify({ studentId }),
                        }
                      );

                      if (!response.ok) {
                        throw new Error(
                          `API request failed with status ${response.status}`
                        );
                      }

                      const data = await response.json();
                      if (data.success) {
                        alert("Student assigned successfully!");
                        window.location.reload();
                      } else {
                        throw new Error("Failed to assign student");
                      }
                    } catch (error) {
                      console.error("Error:", error);
                      alert("An error occurred while assigning student");
                    }
                  }
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Assign Student
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
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedStudent(student.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (
                                confirm(
                                  `Are you sure you want to remove ${student.name} from your class?`
                                ) &&
                                uid
                              ) {
                                try {
                                  // Get the current user's ID token for API authentication
                                  const { auth } = await import(
                                    "@/lib/firebase"
                                  );
                                  const idToken =
                                    await auth.currentUser!.getIdToken();

                                  // Call the API to remove the student
                                  const response = await fetch(
                                    `/api/teacher/${uid}/students`,
                                    {
                                      method: "DELETE",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${idToken}`,
                                      },
                                      body: JSON.stringify({
                                        studentId: student.id,
                                      }),
                                    }
                                  );

                                  if (!response.ok) {
                                    throw new Error(
                                      `API request failed with status ${response.status}`
                                    );
                                  }

                                  const data = await response.json();
                                  if (!data.success) {
                                    throw new Error("Failed to remove student");
                                  }

                                  alert("Student removed successfully!");
                                  window.location.reload();
                                } catch (error) {
                                  console.error("Error:", error);
                                  alert(
                                    "An error occurred while removing student"
                                  );
                                }
                              }
                            }}
                          >
                            Remove
                          </Button>
                        </div>
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
                    {students.find((s) => s.id === selectedStudent)?.name} -
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
                  const student = students.find(
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
                                  {student.fundamentals?.listening || 0}%
                                </span>
                              </div>
                              <Progress
                                value={student.fundamentals?.listening || 0}
                                className="h-2"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-card-foreground">
                                  Grasping Power
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {student.fundamentals?.grasping || 0}%
                                </span>
                              </div>
                              <Progress
                                value={student.fundamentals?.grasping || 0}
                                className="h-2"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-card-foreground">
                                  Retention Power
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {student.fundamentals?.retention || 0}%
                                </span>
                              </div>
                              <Progress
                                value={student.fundamentals?.retention || 0}
                                className="h-2"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-card-foreground">
                                  Practice Application
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {student.fundamentals?.application || 0}%
                                </span>
                              </div>
                              <Progress
                                value={student.fundamentals?.application || 0}
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
