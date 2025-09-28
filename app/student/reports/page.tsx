// /app/student/reports/page.tsx

"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";
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
  FileText,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  Brain,
  Headphones,
  Zap,
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

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
  },
  {
    href: "/student/reports",
    label: "Reports",
    icon: <FileText className="h-4 w-4" />,
    active: true,
  },
];

// Dynamic report data type
interface ReportData {
  name: string;
  lastUpdated: string;
  overallScore: number;
  fundamentals: {
    listening: { score: number; trend: string; change: number };
    grasping: { score: number; trend: string; change: number };
    retention: { score: number; trend: string; change: number };
    application: { score: number; trend: string; change: number };
  };
  strengths: string[];
  improvements: string[];
  recommendations: {
    title: string;
    description: string;
    priority: string;
  }[];
  performanceHistory: {
    date: string;
    fullDate: Date;
    overall: number;
    listening: number;
    grasping: number;
    retention: number;
    application: number;
  }[];
}

const getFundamentalIcon = (type: string) => {
  switch (type) {
    case "listening":
      return <Headphones className="h-5 w-5" />;
    case "grasping":
      return <BookOpen className="h-5 w-5" />;
    case "retention":
      return <Brain className="h-5 w-5" />;
    case "application":
      return <Zap className="h-5 w-5" />;
    default:
      return <Target className="h-5 w-5" />;
  }
};

const getFundamentalColor = (type: string) => {
  switch (type) {
    case "listening":
      return "text-primary";
    case "grasping":
      return "text-secondary";
    case "retention":
      return "text-accent";
    case "application":
      return "text-primary";
    default:
      return "text-muted-foreground";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ReportsPage() {
  const { uid } = useUser();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!uid) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/student/${uid}/reports`);

        if (!response.ok) {
          throw new Error(`Failed to fetch report data: ${response.status}`);
        }

        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError("Failed to load report data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [uid]);

  if (loading) {
    return (
      <AuthGuard requiredRole="student">
        <DashboardLayout
          sidebarItems={sidebarItems}
          userRole="student"
          userName="Loading..."
        >
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading your report...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  if (error || !reportData) {
    return (
      <AuthGuard requiredRole="student">
        <DashboardLayout
          sidebarItems={sidebarItems}
          userRole="student"
          userName="Student"
        >
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {error || "No report data available"}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  // Prepare data for radar chart
  const radarData = [
    { skill: 'Listening', score: reportData.fundamentals.listening.score, fullMark: 100 },
    { skill: 'Grasping', score: reportData.fundamentals.grasping.score, fullMark: 100 },
    { skill: 'Retention', score: reportData.fundamentals.retention.score, fullMark: 100 },
    { skill: 'Application', score: reportData.fundamentals.application.score, fullMark: 100 },
  ];

  // Determine which chart to show based on data availability
  const showLineChart = reportData.performanceHistory && reportData.performanceHistory.length > 1;

  return (
    <AuthGuard requiredRole="student">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="student"
        userName={reportData.name}
      >
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Learning Report
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last updated: {reportData.lastUpdated}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground">
                {reportData.overallScore}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
          </div>

          {/* Learning Fundamentals Detailed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(reportData.fundamentals).map(([key, data]) => (
              <Card key={key} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-2 rounded-lg bg-muted/20 ${getFundamentalColor(
                        key
                      )}`}
                    >
                      {getFundamentalIcon(key)}
                    </div>
                    <div className="flex items-center gap-1">
                      {data.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          data.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {data.change > 0 ? "+" : ""}
                        {data.change}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground capitalize">
                        {key} Skills
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {data.score}%
                      </span>
                    </div>
                    <Progress value={data.score} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Strengths and Areas for Improvement */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Your Strengths
                </CardTitle>
                <CardDescription>Areas where you excel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-card-foreground">
                        {strength}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Areas for Improvement
                </CardTitle>
                <CardDescription>
                  Focus areas for better learning outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.improvements.map((improvement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-card-foreground">
                        {improvement}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Performance Analysis
              </CardTitle>
              <CardDescription>
                {showLineChart 
                  ? "Track your progress across all learning fundamentals over time" 
                  : "Your current skill breakdown"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.performanceHistory && reportData.performanceHistory.length > 0 ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Average Score</div>
                      <div className="text-2xl font-bold">
                        {Math.round(reportData.performanceHistory.reduce((sum, item) => sum + item.overall, 0) / reportData.performanceHistory.length)}%
                      </div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Improvement</div>
                      <div className="text-2xl font-bold">
                        {reportData.performanceHistory.length > 1 
                          ? `${Math.round(reportData.performanceHistory[reportData.performanceHistory.length - 1].overall - reportData.performanceHistory[0].overall)}%` 
                          : "0%"}
                      </div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Best Skill</div>
                      <div className="text-2xl font-bold capitalize">
                        {(() => {
                          const latest = reportData.performanceHistory[reportData.performanceHistory.length - 1];
                          const skills = [
                            { name: "listening", value: latest.listening },
                            { name: "grasping", value: latest.grasping },
                            { name: "retention", value: latest.retention },
                            { name: "application", value: latest.application }
                          ];
                          return skills.reduce((max, skill) => skill.value > max.value ? skill : max).name;
                        })()}
                      </div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Tests Taken</div>
                      <div className="text-2xl font-bold">{reportData.performanceHistory.length}</div>
                    </div>
                  </div>

                  {/* Main Chart - Line or Radar based on data */}
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      {showLineChart ? (
                        // Line Chart for time series data
                        <LineChart
                          data={reportData.performanceHistory}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(date) =>
                              new Date(date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            }
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            tick={{ fontSize: 12 }}
                            interval={0}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            tick={{ fontSize: 12 }}
                            tickCount={6}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "12px"
                            }}
                            formatter={(value, name) => [`${value}%`, name === "overall" ? "Overall Score" : typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : name]}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Legend 
                            verticalAlign="top" 
                            height={36}
                            wrapperStyle={{ paddingBottom: "10px" }}
                            formatter={(value) => (
                              <span className="text-sm">
                                {value === "overall" ? "Overall Score" : value.charAt(0).toUpperCase() + value.slice(1)}
                              </span>
                            )}
                          />

                          {/* Target line at 75% */}
                          <Line 
                            type="monotone" 
                            dataKey={() => 75} 
                            stroke="#94a3b8" 
                            strokeDasharray="5 5"
                            strokeWidth={1.5}
                            dot={false}
                            name="Target"
                            legendType="line"
                          />

                          <Line
                            type="monotone"
                            dataKey="overall"
                            stroke="#4F46E5"
                            strokeWidth={3}
                            activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                            name="overall"
                          />
                          <Line
                            type="monotone"
                            dataKey="listening"
                            stroke="#16A34A"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                            name="listening"
                          />
                          <Line
                            type="monotone"
                            dataKey="grasping"
                            stroke="#F59E0B"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                            name="grasping"
                          />
                          <Line
                            type="monotone"
                            dataKey="retention"
                            stroke="#EF4444"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                            name="retention"
                          />
                          <Line
                            type="monotone"
                            dataKey="application"
                            stroke="#0EA5E9"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                            name="application"
                          />
                        </LineChart>
                      ) : (
                        // Radar Chart for single test snapshot
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#f0f0f0" />
                          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <Radar
                            name="Current Scores"
                            dataKey="score"
                            stroke="#4F46E5"
                            fill="#4F46E5"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "12px"
                            }}
                            formatter={(value) => [`${value}%`, "Score"]}
                          />
                        </RadarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  {/* Individual Skill Mini Charts */}
                  {showLineChart && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {["listening", "grasping", "retention", "application"].map((skill) => (
                        <div key={skill} className="bg-muted/20 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 rounded-md ${getFundamentalColor(skill)} bg-muted/30`}>
                              {getFundamentalIcon(skill)}
                            </div>
                            <div className="font-medium capitalize">{skill}</div>
                          </div>
                          <div className="h-20">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={reportData.performanceHistory}>
                                <Line
                                  type="monotone"
                                  dataKey={skill}
                                  stroke={skill === "listening" ? "#16A34A" : 
                                          skill === "grasping" ? "#F59E0B" : 
                                          skill === "retention" ? "#EF4444" : "#0EA5E9"}
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No performance history available
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Complete more diagnostic tests to see your progress over time
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personalized Recommendations */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Personalized Recommendations
              </CardTitle>
              <CardDescription>
                Tailored suggestions based on your diagnostic results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground mb-1">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {rec.description}
                      </p>
                    </div>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} Priority
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}