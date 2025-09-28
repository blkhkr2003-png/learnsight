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
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BarChart3,
  BookOpen,
  Brain,
  FileText,
  Target,
  CheckCircle,
  ArrowRight,
  Clock,
} from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
    active: true,
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

interface DiagnosticQuestion {
  id: string;
  fundamental: string;
  question: string;
  options: string[];
  difficulty?: number;
  passage?: string;
  timeLimit?: number;
}

export default function DiagnosticTest() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] =
    useState<DiagnosticQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Get current user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        toast.error("Please log in to start the diagnostic test.");
        router.push("/");
        return;
      }
      setUserId(user.uid);
      // Set the user name for display
      setUserName(user.displayName || user.email || "Student");
    });
    return () => unsubscribe();
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      // auto-timeout submit
      handleNextQuestion(true);
      return;
    }
    const t = setTimeout(
      () => setTimeLeft((prev) => (prev !== null ? prev - 1 : prev)),
      1000
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Helper to fetch next question from API
  const fetchQuestion = async (params: {
    attemptId: string;
    lastDifficulty?: number;
    answeredCorrectly?: boolean;
    excludedIds?: string[];
    studentScore?: number;
  }) => {
    try {
      const res = await fetch(`/api/diagnostic/next-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to fetch next question");
      const data = await res.json();
      const q = data?.data?.question;
      if (q) {
        setCurrentQuestion(q);
        const defaultTime =
          q.timeLimit ??
          (q.difficulty && q.difficulty <= 2
            ? 30
            : q.difficulty && q.difficulty <= 4
            ? 45
            : 60);
        setTimeLeft(defaultTime);
      } else {
        setCurrentQuestion(null);
        setTimeLeft(null);
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      toast.error("Failed to load the next question. Please try again.");
      throw error; // Re-throw to allow caller to handle
    }
  };

  // Start diagnostic attempt
  const handleStartTest = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/diagnostic/start-attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to start test");
      const json = await res.json();
      const attempt = json.attempt;
      const newAttemptId = attempt?.id;
      if (!newAttemptId) throw new Error("Invalid start-attempt response");
      setAttemptId(newAttemptId);
      const total = attempt?.expectedQuestionCount ?? 10;
      setTotalQuestions(total);
      setQuestionIndex(0);
      setProgress(0);
      setTestStarted(true);
      await fetchQuestion({ attemptId: newAttemptId });
    } catch (err) {
      console.error(err);
      toast.error("Could not start diagnostic test.");
    }
  };

  // Submit answer and fetch next question (timeout aware)
  const handleNextQuestion = async (timeout = false) => {
    if (!attemptId || !currentQuestion) return;

    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["authorization"] = `Bearer ${token}`;

      const chosenIndex = timeout ? -1 : selectedAnswer ?? -1;

      // Verify we have a valid question ID before submitting
      if (!currentQuestion.id) {
        console.error("No question ID available for submission");
        toast.error("Question data is incomplete. Please try again.");
        return;
      }

      // Disable the submit button to prevent multiple submissions
      const submitButton1 = document.querySelector(
        'button[onClick*="handleNextQuestion"]'
      ) as HTMLButtonElement;
      if (submitButton1) submitButton1.disabled = true;

      const res = await fetch(`/api/diagnostic/submit-answer`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          attemptId,
          questionId: currentQuestion.id,
          chosenIndex,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);

        // Handle the specific error about attempt already completed
        if (errorText.includes("Attempt already completed")) {
          toast.error(
            "This diagnostic test has already been completed. Redirecting to results..."
          );
          setTestCompleted(true);
          return;
        }

        // Handle the specific error about question mismatch
        if (
          errorText.includes(
            "Submitted question does not match last served question"
          )
        ) {
          toast.error(
            "There was a synchronization issue. Loading a new question..."
          );
          // Reset and fetch a new question
          setSelectedAnswer(null);
          try {
            // First, let's get the current attempt to see what the last served question is
            const attemptRes = await fetch(
              `/api/diagnostic/get-attempt?attemptId=${attemptId}`,
              {
                method: "GET",
                headers,
              }
            );

            if (attemptRes.ok) {
              const attemptData = await attemptRes.json();
              const lastServedQuestionId =
                attemptData.attempt?.lastServedQuestionId;

              // If there's a last served question ID, let's fetch that specific question
              if (lastServedQuestionId) {
                const questionRes = await fetch(
                  `/api/questions/${lastServedQuestionId}`,
                  {
                    method: "GET",
                    headers,
                  }
                );

                if (questionRes.ok) {
                  const questionData = await questionRes.json();
                  setCurrentQuestion(questionData);
                  const defaultTime =
                    questionData.timeLimit ??
                    (questionData.difficulty && questionData.difficulty <= 2
                      ? 30
                      : questionData.difficulty && questionData.difficulty <= 4
                      ? 45
                      : 60);
                  setTimeLeft(defaultTime);
                  return;
                }
              }
            }

            // If we can't get the specific question, fetch a new one
            await fetchQuestion({ attemptId });
          } catch (fetchError) {
            const error = fetchError as Error;
            console.error("Error fetching new question after mismatch:", error);
            toast.error(
              "Unable to continue the test. Please refresh the page."
            );
          }
          return;
        }

        throw new Error(
          `Failed to submit answer: ${res.status} ${res.statusText}`
        );
      }

      const json = await res.json();

      const answersCount: number = json.answersCount ?? 0;
      const completed: boolean = !!json.completed;

      setQuestionIndex(answersCount);
      setProgress(Math.min(100, (answersCount / (totalQuestions || 1)) * 100));

      if (completed || answersCount >= (totalQuestions || 0)) {
        setTestCompleted(true);
        return;
      }

      const lastDifficulty = currentQuestion.difficulty ?? 3;
      const answeredCorrectly = timeout ? false : !!json.correct;

      setSelectedAnswer(null);

      // Re-enable the submit button before fetching the next question
      const submitButton2 = document.querySelector(
        'button[onClick*="handleNextQuestion"]'
      ) as HTMLButtonElement;
      if (submitButton2) submitButton2.disabled = false;

      await fetchQuestion({
        attemptId,
        lastDifficulty,
        answeredCorrectly,
      });
    } catch (err) {
      console.error("Error submitting answer:", err);

      // Re-enable the submit button if it exists
      const submitButton3 = document.querySelector(
        'button[onClick*="handleNextQuestion"]'
      ) as HTMLButtonElement;
      if (submitButton3) submitButton3.disabled = false;

      // Only show toast if we haven't already handled the error above
      const error = err as Error;
      if (
        !error.message?.includes("already been completed") &&
        !error.message?.includes("synchronization issue")
      ) {
        toast.error(error.message || "Could not submit answer.");
      }
    }
  };

  // Complete test and redirect to report
  const handleCompleteTest = async () => {
    if (!attemptId || !userId) return;
    try {
      const res = await fetch(`/api/diagnostic/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          studentId: userId,
          generatePractice: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to complete test");
      router.push("/student/reports");
    } catch (err) {
      console.error(err);
      toast.error("Could not complete test.");
    }
  };

  // Render start page
  if (!testStarted) {
    return (
      <AuthGuard requiredRole="student">
        <DashboardLayout
          sidebarItems={sidebarItems}
          userRole="student"
          userName={userName}
        >
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Adaptive Diagnostic Test
              </h1>
              <p className="text-muted-foreground">
                Take our comprehensive assessment to identify your learning
                strengths.
              </p>
            </div>
            <Card className="border-border bg-card text-center">
              <CardContent>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-card-foreground mb-2">
                  Ready to Begin?
                </CardTitle>
                <CardDescription className="mb-6">
                  This adaptive test evaluates your skills across four key
                  fundamentals.
                </CardDescription>
                <Button size="lg" className="w-full" onClick={handleStartTest}>
                  Start Diagnostic Test <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  // Render completed page
  if (testCompleted) {
    return (
      <AuthGuard requiredRole="student">
        <DashboardLayout
          sidebarItems={sidebarItems}
          userRole="student"
          userName={userName}
        >
          <div className="max-w-2xl mx-auto space-y-8">
            <Card className="border-border bg-card text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-card-foreground mb-4">
                  Test Completed!
                </h2>
                <p className="text-muted-foreground mb-8">
                  Your diagnostic results are processed. View your detailed
                  report.
                </p>
                <Button size="lg" onClick={handleCompleteTest}>
                  View My Results <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  // Render current question
  return (
    <AuthGuard requiredRole="student">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="student"
        userName=""
      >
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">
                Diagnostic Test
              </h1>
              <div className="flex items-center gap-4">
                {timeLeft !== null && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {timeLeft}s
                  </div>
                )}
                <span className="text-sm text-muted-foreground">
                  Question {questionIndex + 1}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {!currentQuestion ? (
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
                    Loading...
                  </div>
                </div>
                <CardTitle className="text-xl text-card-foreground">
                  Loading question...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">
                  Please wait while we load the question.
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
                    {currentQuestion.fundamental}
                  </div>
                  {typeof currentQuestion.difficulty === "number" && (
                    <div className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                      {currentQuestion.difficulty <= 2
                        ? "Easy"
                        : currentQuestion.difficulty <= 4
                        ? "Medium"
                        : "Hard"}
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl text-card-foreground">
                  {currentQuestion.question}
                </CardTitle>
                {currentQuestion.passage && (
                  <CardDescription className="text-base mt-4 p-4 bg-muted/50 rounded-lg">
                    {currentQuestion.passage}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedAnswer?.toString()}
                  onValueChange={(v) => setSelectedAnswer(Number(v))}
                >
                  <div className="space-y-4">
                    {currentQuestion.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <RadioGroupItem
                          value={idx.toString()}
                          id={`option-${idx}`}
                        />
                        <Label
                          htmlFor={`option-${idx}`}
                          className="flex-1 cursor-pointer text-card-foreground"
                        >
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <div className="mt-8 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {timeLeft !== null && `Time remaining: ${timeLeft}s`}
                  </div>
                  <Button
                    onClick={() => handleNextQuestion(false)}
                    disabled={selectedAnswer === null}
                    size="lg"
                  >
                    Next Question
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
