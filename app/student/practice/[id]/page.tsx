"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      setAnswers((prev) => ({ ...prev, [questionId]: chosenIndex }));
      if (finish || data.completed) setCompleted(true);
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

  if (userLoading || loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-red-600 p-6">{error}</div>;
  }

  return (
    <AuthGuard requiredRole="student">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="student"
        userName=""
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {title || "Practice Session"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {description || "Answer the questions below."}
              </p>
            </div>
            <div className="w-48">
              <Progress value={progress} />
            </div>
          </div>

          {completed ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" /> Session
                  completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => router.push("/student/practice")}
                  >
                    Back to Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : current ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Question {currentIndex + 1} of {questions.length}
                  </CardTitle>
                  <Badge variant="secondary" className="capitalize">
                    {fundamental}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-lg font-medium text-card-foreground">
                    {current.question}
                  </div>
                  <div className="grid gap-3">
                    {current.options.map((opt, i) => (
                      <Button
                        key={i}
                        variant={
                          answers[current.id] === i ? "default" : "outline"
                        }
                        className="justify-start"
                        disabled={saving}
                        onClick={() => handleChoose(i)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-sm text-muted-foreground">
              No questions found.
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
