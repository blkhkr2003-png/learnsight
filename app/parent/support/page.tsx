"use client";

import AuthGuard from "@/components/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Heart,
  TrendingUp,
  BookOpen,
  Brain,
  Clock,
  Zap,
  Star,
  Target,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

const sidebarItems = [
  {
    href: "/parent/dashboard",
    label: "Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    href: "/parent/progress",
    label: "Progress",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    href: "/parent/support",
    label: "Support Tips",
    icon: <Heart className="h-4 w-4" />,
    active: true,
  },
];

// Mock support data
const supportData = {
  childName: "Ram Kumar",
  personalizedTips: [
    {
      skill: "retention",
      title: "Memory Enhancement Activities",
      description:
        "Help Ram improve memory retention with these targeted activities",
      tips: [
        "Practice the 'memory palace' technique with familiar locations",
        "Use flashcards for 10-15 minutes daily",
        "Encourage storytelling to connect new information",
        "Play memory games like Simon Says or card matching",
      ],
      priority: "High",
    },
    {
      skill: "listening",
      title: "Maintain Listening Excellence",
      description:
        "Keep Ram's strong listening skills sharp with continued practice",
      tips: [
        "Listen to educational podcasts together",
        "Practice active listening during conversations",
        "Use audiobooks for bedtime stories",
        "Encourage note-taking while listening",
      ],
      priority: "Medium",
    },
    {
      skill: "application",
      title: "Problem-Solving Challenges",
      description: "Build on Ram's excellent application skills",
      tips: [
        "Present real-world math problems during daily activities",
        "Encourage building and construction projects",
        "Play strategy games like chess or puzzles",
        "Ask 'what if' questions to promote critical thinking",
      ],
      priority: "Low",
    },
  ],
  generalTips: [
    {
      category: "Study Environment",
      icon: <BookOpen className="h-5 w-5 text-primary" />,
      tips: [
        "Create a quiet, well-lit study space",
        "Remove distractions like TV or loud music",
        "Keep study materials organized and accessible",
        "Ensure comfortable seating and proper lighting",
      ],
    },
    {
      category: "Motivation & Encouragement",
      icon: <Star className="h-5 w-5 text-secondary" />,
      tips: [
        "Celebrate small wins and improvements",
        "Set achievable daily and weekly goals",
        "Use positive reinforcement consistently",
        "Show interest in what they're learning",
      ],
    },
    {
      category: "Healthy Learning Habits",
      icon: <Heart className="h-5 w-5 text-accent" />,
      tips: [
        "Encourage regular breaks during study sessions",
        "Ensure adequate sleep (8-9 hours for teens)",
        "Promote physical activity and outdoor time",
        "Maintain a balanced diet with brain-healthy foods",
      ],
    },
  ],
  resources: [
    {
      title: "Educational Apps for Memory",
      description: "Recommended apps to help improve retention skills",
      type: "app",
      link: "#",
    },
    {
      title: "Parent-Teacher Communication Guide",
      description: "How to effectively communicate with your child's teacher",
      type: "guide",
      link: "#",
    },
    {
      title: "Learning Disabilities Support",
      description: "Resources if you suspect learning challenges",
      type: "support",
      link: "#",
    },
  ],
  weeklySchedule: {
    title: "Suggested Weekly Support Schedule",
    activities: [
      { day: "Monday", activity: "Review weekend learning, set weekly goals" },
      { day: "Tuesday", activity: "Memory games and retention practice" },
      { day: "Wednesday", activity: "Check in on homework progress" },
      {
        day: "Thursday",
        activity: "Listening activities (podcasts, audiobooks)",
      },
      {
        day: "Friday",
        activity: "Problem-solving games and real-world applications",
      },
      {
        day: "Saturday",
        activity: "Fun educational activities and field trips",
      },
      {
        day: "Sunday",
        activity: "Reflect on the week and celebrate achievements",
      },
    ],
  },
};

const getSkillIcon = (skill: string) => {
  switch (skill) {
    case "listening":
      return <BookOpen className="h-5 w-5 text-primary" />;
    case "grasping":
      return <Brain className="h-5 w-5 text-secondary" />;
    case "retention":
      return <Clock className="h-5 w-5 text-accent" />;
    case "application":
      return <Zap className="h-5 w-5 text-primary" />;
    default:
      return <Target className="h-5 w-5" />;
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

export default function SupportPage() {
  return (
    <AuthGuard requiredRole="parent">
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole="parent"
        userName="Mr. Rajesh Kumar"
      >
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Supporting {supportData.childName}&apos;s Learning
            </h1>
            <p className="text-muted-foreground">
              Personalized tips and strategies to help your child succeed in
              their learning journey
            </p>
          </div>

          {/* Personalized Tips */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">
              Personalized Support Tips
            </h2>
            <div className="grid gap-6">
              {supportData.personalizedTips.map((tip, index) => (
                <Card key={index} className="border-border bg-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getSkillIcon(tip.skill)}
                        <div>
                          <CardTitle className="text-card-foreground">
                            {tip.title}
                          </CardTitle>
                          <CardDescription>{tip.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(tip.priority)}>
                        {tip.priority} Priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tip.tips.map((tipItem, tipIndex) => (
                        <div
                          key={tipIndex}
                          className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-card-foreground">
                            {tipItem}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* General Tips */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">
              General Support Strategies
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {supportData.generalTips.map((category, index) => (
                <Card key={index} className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground flex items-center gap-2">
                      {category.icon}
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.tips.map((tip, tipIndex) => (
                        <div
                          key={tipIndex}
                          className="text-sm text-muted-foreground p-2 bg-muted/20 rounded"
                        >
                          {tip}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Weekly Schedule */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                {supportData.weeklySchedule.title}
              </CardTitle>
              <CardDescription>
                A structured approach to supporting your child&apos;s learning
                throughout the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {supportData.weeklySchedule.activities.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg"
                  >
                    <div className="w-20 text-sm font-medium text-primary">
                      {item.day}
                    </div>
                    <div className="text-sm text-card-foreground">
                      {item.activity}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Additional Resources
              </CardTitle>
              <CardDescription>
                Helpful tools and guides for supporting your child&apos;s education
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportData.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-card-foreground mb-1">
                        {resource.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {resource.description}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="border-border bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">
                    Need More Help?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with your child&apos;s teacher or our support team for
                    personalized guidance
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Teacher
                  </Button>
                  <Button>Get Support</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
