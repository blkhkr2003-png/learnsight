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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<PracticeListItem[]>([]);

  async function fetchSessions(withGenerate = false) {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      const res = await fetch("/api/practice/sessions", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load sessions");
      const data = await res.json();
      let arr: any[] = Array.isArray(data.sessions) ? data.sessions : [];

      // If no sessions exist, generate a starter set
      if (withGenerate && arr.length === 0 && user?.uid) {
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
        type: (s.type || s.fundamental || "listening") as PracticeListItem["type"],
        estimatedTime: typeof s.estimatedTime === "number" ? s.estimatedTime : 10,
        progress: typeof s.progress === "number" ? s.progress : 0,
        recommended: !!s.recommended,
        completed: !!s.completed,
      }));

      setSessions(mapped);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Unable to load practice");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const recommended = sessions.filter((s) => s.recommended).length;
    const inProgress = sessions.filter((s) => s.progress > 0 && s.progress < 100).length;
    const completed = sessions.filter((s) => s.completed || s.progress === 100).length;
    return { recommended, inProgress, completed };
  }, [sessions]);

  const handleOpenSession = (id: string) => {
    router.push(`/student/practice/${id}`);
  };

  return (
    <AuthGuard requiredRole="student">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="student"
        userName="Ram Kumar"
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
                    <p className="text-2xl font-bold text-card-foreground">{stats.recommended}</p>
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
                    <p className="text-2xl font-bold text-card-foreground">{stats.inProgress}</p>
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
                    <p className="text-2xl font-bold text-card-foreground">{stats.completed}</p>
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

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {loading && (
              <div className="text-sm text-muted-foreground">Loading practice sessions...</div>
            )}

            <div className="grid gap-6">
              {sessions.map((practice) => (
                <Card key={practice.id} className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`p-2 rounded-lg ${getTypeColor(
                              practice.type
                            )}`}
                          >
                            {getTypeIcon(practice.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-card-foreground">
                              {practice.title || "Practice Session"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {practice.description || "Adaptive practice session"}
                            </p>
                          </div>
                          {practice.recommended && (
                            <Badge variant="secondary" className="ml-auto">
                              <Star className="h-3 w-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <Badge className={getDifficultyColor("Medium")}>
                            Medium
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {practice.estimatedTime} min
                          </span>
                          <span className="text-sm text-muted-foreground capitalize">
                            {practice.type} skills
                          </span>
                        </div>

                        {practice.progress > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">
                                Progress
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {practice.progress}%
                              </span>
                            </div>
                            <Progress
                              value={practice.progress}
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>

                      <div className="ml-6 flex flex-col gap-2">
                        {practice.progress === 100 ? (
                          <Button variant="outline" size="sm" onClick={() => handleOpenSession(practice.id)}>
                            <Repeat className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        ) : practice.progress > 0 ? (
                          <Button size="sm" onClick={() => handleOpenSession(practice.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Continue
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleOpenSession(practice.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                        )}

                        {practice.progress === 100 && (
                          <div className="flex items-center gap-1 text-sm text-accent">
                            <CheckCircle className="h-4 w-4" />
                            Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
