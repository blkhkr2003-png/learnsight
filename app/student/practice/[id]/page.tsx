// /app/student/practice/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/user-context";
import { Loader } from "@/components/ui/loader";
import AuthGuard from "@/components/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";

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
  ArrowRight,
} from "lucide-react";

interface Question {
  id: string;
  fundamental: string;
  difficulty: number;
  question: string;
  options: string[];
  timeLimit: number;
}

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

export default function PracticeRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;
  const { uid, loading: userLoading } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [fundamental, setFundamental] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`/api/practice/session/${sessionId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to load session");
        const data = await res.json();
        setTitle(data.title);
        setDescription(data.description);
        setFundamental(data.fundamental);
        setQuestions(Array.isArray(data.questions) ? data.questions : []);
        const a: Record<string, number> = {};
        (Array.isArray(data.answers) ? data.answers : []).forEach((x: any) => {
          if (typeof x.chosenIndex === "number")
            a[x.questionId] = x.chosenIndex;
        });
        setAnswers(a);
        setCompleted(!!data.completed);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Unable to load session");
      } finally {
        setLoading(false);
      }
    }
    if (!userLoading && uid && sessionId) load();
  }, [userLoading, uid, sessionId]);

  const progress = useMemo(() => {
    const total = questions.length || 1;
    const answered = Object.keys(answers).length;
    return Math.min(100, Math.round((answered / total) * 100));
  }, [questions.length, answers]);

  const currentIndex = useMemo(() => {
    // pick first unanswered index
    const idx = questions.findIndex((q) => answers[q.id] === undefined);
    return idx === -1 ? questions.length - 1 : idx;
  }, [questions, answers]);

  const current = questions[currentIndex];

  async function saveAnswer(
    questionId: string,
    chosenIndex: number,
    finish = false
  ) {
    try {
      setSaving(true);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/practice/session/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          answers: [{ questionId, chosenIndex }],
          completed: finish,
        }),
      });
      if (!res.ok) throw new Error("Failed to save answer");
      const data = await res.json();

      // Update state without triggering a loading state
      setAnswers((prev) => ({ ...prev, [questionId]: chosenIndex }));
      if (finish || data.completed) {
        setCompleted(true);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Unable to save answer");
    } finally {
      setSaving(false);
    }
  }

  function handleChoose(i: number) {
    if (!current) return;
    const last = currentIndex >= questions.length - 1;
    saveAnswer(current.id, i, last);
  }

  // Show a loading overlay within the layout instead of replacing the entire layout
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  useEffect(() => {
    if (userLoading || loading) {
      setShowLoadingOverlay(true);
    } else {
      setShowLoadingOverlay(false);
    }
  }, [userLoading, loading]);

  if (error) {
    return (
      <AuthGuard requiredRole="student">
        <DashboardLayout
          sidebarItems={sidebarItems}
          userRole="student"
          userName={
            auth.currentUser?.displayName ||
            auth.currentUser?.email ||
            "Student"
          }
        >
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <div className="w-10 h-10 border-4 border-destructive border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">{error}</p>
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
        userName=""
      >
        {/* Loading overlay that appears on top of the layout */}
        {showLoadingOverlay && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-sm">
            <Loader />
          </div>
        )}
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {title || "Practice Session"}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} of {questions.length}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-muted-foreground">
              {description ||
                "Answer the questions below to improve your skills."}
            </p>
          </div>

          {completed ? (
            <Card className="border-border bg-card text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-card-foreground mb-4">
                  Practice Completed!
                </h2>
                <p className="text-muted-foreground mb-8">
                  Great job! You've completed this practice session.
                </p>
                <Button
                  size="lg"
                  onClick={() => router.push("/student/practice")}
                >
                  Back to Practice <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : current ? (
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
                    {fundamental}
                  </div>
                  {typeof current.difficulty === "number" && (
                    <div className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                      {current.difficulty <= 2
                        ? "Easy"
                        : current.difficulty <= 4
                        ? "Medium"
                        : "Hard"}
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl text-card-foreground">
                  {current.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {current.options.map((opt, i) => (
                      <Button
                        key={i}
                        variant={
                          answers[current.id] === i ? "default" : "outline"
                        }
                        className="justify-start p-4 h-auto transition-all duration-200"
                        disabled={saving}
                        onClick={() => handleChoose(i)}
                      >
                        <span className="text-left">{opt}</span>
                        {saving && answers[current.id] === i && (
                          <div className="ml-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-card text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-card-foreground mb-4">
                  No Questions Found
                </h2>
                <p className="text-muted-foreground mb-8">
                  There are no questions available in this practice session.
                </p>
                <Button
                  size="lg"
                  onClick={() => router.push("/student/practice")}
                >
                  Back to Practice <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
