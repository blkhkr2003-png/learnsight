"use client";

import { Loader } from "@/components/ui/loader"; // 👈 import at top
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth-guard";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StudentDashboardData } from "@/types";
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
import { toast } from "sonner";

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

export default function StudentDashboard() {
  const router = useRouter();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true); // 👈 Added loading state

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast.error("Please log in to access your dashboard.");
        router.push("/");
        return;
      }

      try {
        const res = await fetch(`/api/student/${user.uid}/dashboard`);
        if (!res.ok) throw new Error("No data found");
        const json: StudentDashboardData = await res.json();

        if (!json) {
          toast.error("No data available for your account.");
          router.push("/");
          return;
        }

        setData(json);
      } catch (err) {
        console.error(err);
        toast.error("No data available for your account.");
        router.push("/");
      } finally {
        setLoading(false); // 👈 Stop loading
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 👇 While loading
  if (loading) {
    return (
      <AuthGuard requiredRole="student">
        <DashboardLayout
          sidebarItems={sidebarItems}
          userRole="student"
          userName=""
        >
          <Loader /> {/* 👈 Beautiful loader */}
        </DashboardLayout>
      </AuthGuard>
    );
  }

  // 👇 In case of no data but no redirect yet
  if (!data) {
    return (
      <AuthGuard requiredRole="student">
        <DashboardLayout
          sidebarItems={sidebarItems}
          userRole="student"
          userName=""
        >
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <div className="w-10 h-10 border-4 border-destructive border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">
              No data available. Please refresh or contact support.
            </p>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="student">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="student"
        userName={data.name}
      >
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {data.name}!
            </h1>
            <p className="text-muted-foreground">
              Ready to continue your learning journey? Let’s see how you’re
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
                      {data.overallProgress ?? 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <Progress value={data.overallProgress ?? 0} className="mt-3" />
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
                      {data.practiceStreak ?? 0} days
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
                      {data.completedPractices}/{data.totalPractices}
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
                      {data.lastDiagnostic
                        ? new Date(data.lastDiagnostic).toLocaleDateString()
                        : "N/A"}
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

          {/* Learning Fundamentals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    {Object.entries(data.fundamentals).map(([key, value]) => (
                      <div className="space-y-2" key={key}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-card-foreground">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {value}%
                          </span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-border">
                    <Button className="w-full" asChild>
                      <Link href="/student/reports">View Detailed Report</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions + Recommendations */}
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
                    {data.recommendations?.map((rec, index) => (
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
                {data.recentPractices?.map((practice) => (
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
                          {practice.title || "Practice Session"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {practice.completed ? "Completed" : "In Progress"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {practice.completed && practice.score != null && (
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
