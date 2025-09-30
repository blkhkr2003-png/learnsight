// /app/student/practice/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AuthGuard from "@/components/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { auth } from "@/lib/firebase";
import { useUser } from "@/contexts/user-context";
import { Loader } from "@/components/ui/loader";

import {
  BarChart3,
  BookOpen,
  FileText,
  Target,
  Play,
  CheckCircle,
  Clock,
  Star,
  Headphones,
  Brain,
  Repeat,
  Zap,
} from "lucide-react";

const sidebarItems = [
  {
    href: "/student/dashboard",
    label: "Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
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
    active: true,
  },
  {
    href: "/student/reports",
    label: "Reports",
    icon: <FileText className="h-4 w-4" />,
  },
];

// Data shape for the UI cards
type PracticeListItem = {
  id: string;
  title: string | null;
  description: string | null;
  type: "listening" | "grasping" | "retention" | "application";
  estimatedTime: number; // minutes
  progress: number; // 0..100
  recommended: boolean;
  completed: boolean;
};

type FundamentalsScores = {
  listening: number;
  grasping: number;
  retention: number;
  application: number;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "listening":
      return <Headphones className="h-4 w-4" />;
    case "grasping":
      return <BookOpen className="h-4 w-4" />;
    case "retention":
      return <Brain className="h-4 w-4" />;
    case "application":
      return <Zap className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "listening":
      return "bg-primary/10 text-primary";
    case "grasping":
      return "bg-secondary/10 text-secondary";
    case "retention":
      return "bg-accent/10 text-accent";
    case "application":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted/10 text-muted-foreground";
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "bg-green-100 text-green-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Hard":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function PracticePage() {
  const router = useRouter();
  const { uid, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<PracticeListItem[]>([]);
  const [fundamentals, setFundamentals] = useState<FundamentalsScores | null>(
    null
  );

  async function fetchSessions(withGenerate = false, attemptId?: string) {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      if (!user) {
        // Instead of throwing an error, we'll set an error message and return
        setError("User not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      // Build URL with attemptId if provided
      let url = `/api/practice/sessions?userId=${user.uid}`;
      if (attemptId) {
        url += `&attemptId=${attemptId}`;
      }

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `Failed to load sessions: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();
      let arr: any[] = Array.isArray(data.sessions) ? data.sessions : [];

      // If no sessions exist, generate a starter set
      if (withGenerate && arr.length === 0) {
        const genRes = await fetch("/api/practice/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            studentId: user.uid,
            fundamentals: ["listening", "grasping", "retention", "application"],
            count: 5,
          }),
        });
        if (genRes.ok) {
          const gen = await genRes.json();
          arr = gen.practiceSessions || [];
        }
      }

      const mapped: PracticeListItem[] = arr.map((s: any) => ({
        id: s.id,
        title: s.title || null,
        description: s.description || null,
        type: (s.type ||
          s.fundamental ||
          "listening") as PracticeListItem["type"],
        estimatedTime:
          typeof s.estimatedTime === "number" ? s.estimatedTime : 10,
        progress: typeof s.progress === "number" ? s.progress : 0,
        recommended: !!s.recommended,
        completed: !!s.completed,
      }));

      setSessions(mapped);

      // Fetch last diagnostic scores for per-fundamental logic
      const dashRes = await fetch(`/api/student/${user.uid}/dashboard`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (dashRes.ok) {
        const dash = await dashRes.json();
        const f = dash?.fundamentals ?? {
          listening: 0,
          grasping: 0,
          retention: 0,
          application: 0,
        };
        setFundamentals(f as FundamentalsScores);
      }
    } catch (e: any) {
      console.error("Error loading practice sessions:", e);
      setError(e?.message || "Unable to load practice sessions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Only fetch when user is authenticated and user context finished loading
    if (!userLoading && uid) {
      // First get the user's latest diagnostic attempt ID
      const fetchLatestAttemptId = async () => {
        try {
          const user = auth.currentUser;
          const token = await user?.getIdToken();

          const res = await fetch(`/api/student/${uid}/dashboard`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (res.ok) {
            const data = await res.json();
            // Get the last attempt ID from the dashboard data
            // We need to fetch the diagnostic attempt to get its ID
            if (data.lastDiagnostic) {
              const diagRes = await fetch(
                `/api/diagnostic/attempt/latest?userId=${uid}`,
                {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
              );

              if (diagRes.ok) {
                const diagData = await diagRes.json();
                if (diagData.attempt?.id) {
                  return diagData.attempt.id;
                }
              }
            }
          }
          return undefined;
        } catch (error) {
          console.error("Error fetching latest attempt ID:", error);
          return undefined;
        }
      };

      // Fetch the latest attempt ID and then fetch sessions
      fetchLatestAttemptId().then((attemptId) => {
        fetchSessions(true, attemptId);
      });
    }
  }, [userLoading, uid]);

  const stats = useMemo(() => {
    const recommended = sessions.filter(
      (s: PracticeListItem) => s.recommended
    ).length;
    const inProgress = sessions.filter(
      (s: PracticeListItem) => s.progress > 0 && s.progress < 100
    ).length;
    const completed = sessions.filter(
      (s: PracticeListItem) => s.completed || s.progress === 100
    ).length;
    return { recommended, inProgress, completed };
  }, [sessions]);

  const handleOpenSession = (id: string) => {
    router.push(`/student/practice/${id}`);
  };

  // Ensure a session exists for the requested fundamental and navigate to it
  const ensureAndOpen = async (fundamental: PracticeListItem["type"]) => {
    try {
      const existing = sessions.find(
        (s: PracticeListItem) => s.type === fundamental && s.progress < 100
      );
      if (existing) {
        return handleOpenSession(existing.id);
      }
      const user = auth.currentUser;
      const token = await user?.getIdToken();

      // Get the latest attempt ID
      let attemptId;
      try {
        const diagRes = await fetch(
          `/api/diagnostic/attempt/latest?userId=${user?.uid}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (diagRes.ok) {
          const diagData = await diagRes.json();
          if (diagData.attempt?.id) {
            attemptId = diagData.attempt.id;
          }
        }
      } catch (error) {
        console.error("Error fetching latest attempt ID:", error);
      }

      const genRes = await fetch("/api/practice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          studentId: user?.uid,
          fundamentals: [fundamental],
          count: 5,
          attemptId,
        }),
      });
      if (genRes.ok) {
        const gen = await genRes.json();
        const created = (gen.practiceSessions || []).find(
          (x: any) => x.fundamental === fundamental
        );
        // Refresh local sessions cache
        await fetchSessions(false);
        if (created?.id) return handleOpenSession(created.id);
        // Fallback: try find newly fetched
        const fresh = sessions.find(
          (s: PracticeListItem) => s.type === fundamental
        );
        if (fresh) return handleOpenSession(fresh.id);
      }
    } catch (e) {
      console.error(e);
      setError("Unable to open practice session");
    }
  };

  return (
    <AuthGuard requiredRole="student">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="student"
        userName={
          auth.currentUser?.displayName || auth.currentUser?.email || "Student"
        }
      >
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Practice Queue
            </h1>
            <p className="text-muted-foreground">
              Personalized practice exercises based on your diagnostic results
              and learning goals.
            </p>
          </div>

          {/* Practice Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Recommended
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {stats.recommended}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      In Progress
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {stats.inProgress}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-secondary" />
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
                      {stats.completed}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Practice Queue */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">
              Your Practice Exercises
            </h2>

            {error && <div className="text-sm text-red-600">{error}</div>}
            {loading && <Loader />}

            <div className="grid gap-6">
              {(
                ["listening", "grasping", "retention", "application"] as const
              ).map((f) => {
                const list = sessions.filter(
                  (s: PracticeListItem) => s.type === f
                );
                const active =
                  list.find(
                    (s: PracticeListItem) => s.progress > 0 && s.progress < 100
                  ) || list[0];
                const completed = list.find(
                  (s: PracticeListItem) => s.progress === 100 || s.completed
                );
                const score = fundamentals?.[f] ?? 0;
                const progress = active?.progress ?? (completed ? 100 : 0);
                const estimatedTime = active?.estimatedTime ?? 10;
                const title = `${f.charAt(0).toUpperCase()}${f.slice(
                  1
                )} Practice`;
                const desc = `Practice exercises for ${f} skills`;
                const showRetry = score === 100 || progress === 100;
                const buttonLabel = showRetry
                  ? "Retry"
                  : active
                  ? progress > 0
                    ? "Continue"
                    : "Start"
                  : "Start";
                const onClick = () => {
                  if (active) return handleOpenSession(active.id);
                  return ensureAndOpen(f);
                };

                return (
                  <Card key={f} className="border-border bg-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`p-2 rounded-lg ${getTypeColor(f)}`}
                            >
                              {getTypeIcon(f)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-card-foreground">
                                {title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {desc}
                              </p>
                            </div>
                            {active?.recommended && (
                              <Badge variant="secondary" className="ml-auto">
                                <Star className="h-3 w-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            <Badge className={getDifficultyColor("Medium")}>
                              {score === 100 ? "Mastered" : "Medium"}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {estimatedTime} min
                            </span>
                            <span className="text-sm text-muted-foreground capitalize">
                              {f} skills
                            </span>
                          </div>

                          {progress > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">
                                  Progress
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {progress}%
                                </span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                        </div>

                        <div className="ml-6 flex flex-col gap-2">
                          <Button
                            variant={showRetry ? "outline" : "default"}
                            size="sm"
                            onClick={onClick}
                          >
                            {showRetry ? (
                              <Repeat className="h-4 w-4 mr-2" />
                            ) : (
                              <Play className="h-4 w-4 mr-2" />
                            )}
                            {buttonLabel}
                          </Button>

                          {showRetry && (
                            <div className="flex items-center gap-1 text-sm text-accent">
                              <CheckCircle className="h-4 w-4" />
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Practice Tips */}
          <Card className="border-border bg-muted/30">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Practice Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">
                    Maximize Your Learning
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Focus on recommended exercises first</li>
                    <li>• Take breaks between difficult sessions</li>
                    <li>• Review explanations after each question</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">
                    Track Your Progress
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Complete exercises regularly for best results</li>
                    <li>• Check your reports to see improvement</li>
                    <li>• Retry completed exercises to reinforce learning</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
