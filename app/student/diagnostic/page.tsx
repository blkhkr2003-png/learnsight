"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
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
import { useRouter } from "next/navigation";

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

// Mock adaptive questions
const diagnosticQuestions = [
  {
    id: 1,
    type: "listening",
    question: "Listen to the audio clip and identify the main topic discussed.",
    options: [
      "Climate change effects",
      "Economic policies",
      "Educational reforms",
      "Technology advancement",
    ],
    correctAnswer: 0,
  },
  {
    id: 2,
    type: "grasping",
    question: "Read the passage and determine the author's primary argument.",
    passage:
      "The rapid advancement of artificial intelligence has transformed various industries...",
    options: [
      "AI is dangerous for society",
      "AI brings both opportunities and challenges",
      "AI will replace all human jobs",
      "AI development should be stopped",
    ],
    correctAnswer: 1,
  },
  {
    id: 3,
    type: "retention",
    question:
      "Based on the information presented earlier, what was the key statistic mentioned?",
    options: [
      "75% increase in productivity",
      "50% reduction in costs",
      "90% user satisfaction",
      "25% market growth",
    ],
    correctAnswer: 0,
  },
  {
    id: 4,
    type: "application",
    question:
      "Apply the concept learned to solve this problem: If the pattern continues, what comes next?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 2,
  },
];

export default function DiagnosticTest() {
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const router = useRouter();

  const handleStartTest = () => {
    setTestStarted(true);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);
      setSelectedAnswer(null);

      if (currentQuestion < diagnosticQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setTestCompleted(true);
      }
    }
  };

  const handleCompleteTest = () => {
    // TODO: Submit results to backend
    router.push("/student/reports");
  };

  const progress = ((currentQuestion + 1) / diagnosticQuestions.length) * 100;

  if (!testStarted) {
    return (
      <AuthGuard requiredRole="student">
        <DashboardLayout
          sidebarItems={sidebarItems}
          userRole="student"
          userName="Ram Kumar"
        >
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Adaptive Diagnostic Test
              </h1>
              <p className="text-muted-foreground">
                Take our comprehensive assessment to identify your learning
                strengths and areas for improvement.
              </p>
            </div>

            <Card className="border-border bg-card">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-card-foreground">
                  Ready to Begin?
                </CardTitle>
                <CardDescription className="text-lg">
                  This adaptive test will evaluate your skills across four key
                  learning fundamentals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-card-foreground">
                      What you'll be tested on:
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Listening Skills - Audio comprehension
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        Grasping Power - Reading comprehension
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        Retention Power - Memory and recall
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Practice Application - Problem solving
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-card-foreground">
                      Test Details:
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Approximately 15-20 minutes
                      </li>
                      <li className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Adaptive difficulty based on responses
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Immediate results and recommendations
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleStartTest}
                  >
                    Start Diagnostic Test
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  if (testCompleted) {
    return (
      <AuthGuard requiredRole="student">
        <DashboardLayout
          sidebarItems={sidebarItems}
          userRole="student"
          userName="Ram Kumar"
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
                  Great job! Your diagnostic results are being processed. You'll
                  be redirected to view your detailed report.
                </p>
                <Button size="lg" onClick={handleCompleteTest}>
                  View My Results
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  const question = diagnosticQuestions[currentQuestion];

  return (
    <AuthGuard requiredRole="student">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="student"
        userName="Ram Kumar"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Progress Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">
                Diagnostic Test
              </h1>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {diagnosticQuestions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
                  {question.type}
                </div>
              </div>
              <CardTitle className="text-xl text-card-foreground">
                {question.question}
              </CardTitle>
              {question.passage && (
                <CardDescription className="text-base mt-4 p-4 bg-muted/50 rounded-lg">
                  {question.passage}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedAnswer?.toString()}
                onValueChange={(value: string) =>
                  setSelectedAnswer(Number.parseInt(value))
                }
              >
                <div className="space-y-4">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <RadioGroupItem
                        value={index.toString()}
                        id={`option-${index}`}
                      />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer text-card-foreground"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                  size="lg"
                >
                  {currentQuestion < diagnosticQuestions.length - 1
                    ? "Next Question"
                    : "Complete Test"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
