"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Target, TrendingUp, Users, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
        {/* Decorative Background Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-accent/20 rounded-full blur-3xl animate-pulse delay-200"></div>
        <div className="absolute -top-20 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-500"></div>

        <div className="container mx-auto text-center max-w-4xl relative z-10">
          {/* Hero Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-text">
              Adaptive Diagnostics
            </span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-accent via-primary to-secondary animate-text">
              Personalized Practice
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in delay-300">
            Transform learning with AI-powered diagnostics that identify
            strengths and gaps across four key fundamentals.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-500">
            <Button
              size="lg"
              variant="default"
              asChild
              className="group relative overflow-hidden"
            >
              <Link href="/login?role=student">
                <Target className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Login as Student
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="group relative overflow-hidden border-2 hover:border-secondary"
            >
              <Link href="/login?role=teacher">
                <Users className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Login as Teacher
              </Link>
            </Button>

            <Button
              size="lg"
              variant="ghost"
              asChild
              className="group relative overflow-hidden hover:text-accent"
            >
              <Link href="/login?role=parent">
                <BarChart3 className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Login as Parent
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative py-28 px-6 bg-gradient-to-b from-background via-muted/30 to-background overflow-hidden"
      >
        {/* Decorative Background Blobs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-gradient-to-tr from-blue-400/40 to-purple-400/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-gradient-to-tr from-green-400/40 to-teal-400/40 rounded-full blur-3xl animate-pulse"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-500 via-purple-600 to-green-500 bg-clip-text text-transparent drop-shadow-lg">
              Four Learning Fundamentals
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive assessment and practice for complete learning
              mastery
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Listening Skills */}
            <div className="group relative text-center p-8 rounded-2xl bg-gradient-to-br from-blue-600/90 via-blue-500/80 to-blue-400/70 text-white shadow-lg hover:shadow-2xl hover:scale-[1.05] transition-all duration-500">
              <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center animate-bounce">
                <div className="absolute inset-0 rounded-xl bg-blue-400/60 blur-lg group-hover:animate-pulse"></div>
                <div className="relative w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-tr from-blue-700 to-blue-400 text-2xl shadow-lg">
                  👂
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Listening Skills</h3>
              <p className="opacity-90">
                Assess and improve auditory processing and comprehension
                abilities
              </p>
            </div>

            {/* Grasping Power */}
            <div className="group relative text-center p-8 rounded-2xl bg-gradient-to-br from-teal-600/90 via-teal-500/80 to-teal-400/70 text-white shadow-lg hover:shadow-2xl hover:scale-[1.05] transition-all duration-500">
              <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center animate-bounce delay-200">
                <div className="absolute inset-0 rounded-xl bg-teal-400/60 blur-lg group-hover:animate-pulse"></div>
                <div className="relative w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-tr from-teal-700 to-teal-400 text-2xl shadow-lg">
                  🧠
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Grasping Power</h3>
              <p className="opacity-90">
                Evaluate comprehension speed and depth of understanding
              </p>
            </div>

            {/* Retention Power */}
            <div className="group relative text-center p-8 rounded-2xl bg-gradient-to-br from-purple-600/90 via-purple-500/80 to-purple-400/70 text-white shadow-lg hover:shadow-2xl hover:scale-[1.05] transition-all duration-500">
              <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center animate-bounce delay-500">
                <div className="absolute inset-0 rounded-xl bg-purple-400/60 blur-lg group-hover:animate-pulse"></div>
                <div className="relative w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-tr from-purple-700 to-purple-400 text-2xl shadow-lg">
                  💭
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Retention Power</h3>
              <p className="opacity-90">
                Measure memory strength and information recall capabilities
              </p>
            </div>

            {/* Practice Application */}
            <div className="group relative text-center p-8 rounded-2xl bg-gradient-to-br from-green-600/90 via-green-500/80 to-green-400/70 text-white shadow-lg hover:shadow-2xl hover:scale-[1.05] transition-all duration-500">
              <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center animate-bounce delay-700">
                <div className="absolute inset-0 rounded-xl bg-green-400/60 blur-lg group-hover:animate-pulse"></div>
                <div className="relative w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-tr from-green-700 to-green-400 text-2xl shadow-lg">
                  ⚡
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Practice Application
              </h3>
              <p className="opacity-90">
                Test practical application and concept transfer skills
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="relative py-28 px-6 bg-gradient-to-b from-muted/40 via-background to-muted/20 overflow-hidden"
      >
        {/* Decorative Background Graphics */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 bg-accent/5 rounded-full blur-3xl animate-ping"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h3 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-md">
              How LearnSight Works
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple, science-backed process designed to help you learn
              smarter and improve faster.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <Card className="group relative text-center p-10 rounded-3xl bg-card/80 backdrop-blur-xl border border-border overflow-hidden shadow-md transition-all duration-500 hover:shadow-2xl hover:scale-[1.04]">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-primary/40 via-primary/20 to-transparent"></div>

              <CardContent className="relative pt-6">
                <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-bounce">
                  <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl group-hover:animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-tr from-primary/40 to-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <Target className="h-10 w-10 text-primary drop-shadow-lg" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold mb-4 text-card-foreground">
                  1. Take a Smart Diagnostic
                </h4>
                <p className="text-muted-foreground">
                  Start with an adaptive test that adjusts in real-time,
                  uncovering your exact strengths and focus areas across four
                  learning fundamentals.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="group relative text-center p-10 rounded-3xl bg-card/80 backdrop-blur-xl border border-border overflow-hidden shadow-md transition-all duration-500 hover:shadow-2xl hover:scale-[1.04]">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-secondary/40 via-secondary/20 to-transparent"></div>

              <CardContent className="relative pt-6">
                <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-bounce delay-200">
                  <div className="absolute inset-0 rounded-2xl bg-secondary/30 blur-xl group-hover:animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-tr from-secondary/40 to-secondary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                    <Brain className="h-10 w-10 text-secondary drop-shadow-lg" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold mb-4 text-card-foreground">
                  2. Unlock Deep Insights
                </h4>
                <p className="text-muted-foreground">
                  Instantly see where you shine and where you need work with
                  clear, easy-to-read analytics on comprehension, retention, and
                  application skills.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="group relative text-center p-10 rounded-3xl bg-card/80 backdrop-blur-xl border border-border overflow-hidden shadow-md transition-all duration-500 hover:shadow-2xl hover:scale-[1.04]">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-accent/40 via-accent/20 to-transparent"></div>

              <CardContent className="relative pt-6">
                <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-bounce delay-500">
                  <div className="absolute inset-0 rounded-2xl bg-accent/30 blur-xl group-hover:animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-tr from-accent/40 to-accent/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    <TrendingUp className="h-10 w-10 text-accent drop-shadow-lg" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold mb-4 text-card-foreground">
                  3. Practice & Improve
                </h4>
                <p className="text-muted-foreground">
                  Get personalized exercises designed just for you — practice
                  what matters most and watch your progress accelerate with
                  every session.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative py-28 px-6 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden"
      >
        {/* Decorative Blobs */}
        <div className="absolute top-16 left-16 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-16 right-16 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h3 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Built for Everyone
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Tailored experiences for students, teachers, and parents
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Student Features */}
            <Card className="group relative p-10 rounded-3xl bg-card/70 backdrop-blur-xl border border-border shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-primary/30 via-primary/10 to-transparent"></div>
              <CardContent className="relative">
                <div className="w-16 h-16 bg-gradient-to-tr from-primary/40 to-primary/20 rounded-xl flex items-center justify-center mb-6 animate-bounce group-hover:scale-110 transition-transform duration-500">
                  <Users className="h-8 w-8 text-primary drop-shadow-lg" />
                </div>
                <h4 className="text-2xl font-bold mb-6 text-card-foreground">
                  For Students
                </h4>
                <ul className="space-y-4 text-left">
                  <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-sm shadow-md">
                      🎯
                    </div>
                    <span className="text-card-foreground font-medium">
                      Smart adaptive tests
                    </span>
                  </li>
                  <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-sm shadow-md">
                      📚
                    </div>
                    <span className="text-card-foreground font-medium">
                      Personalized practice path
                    </span>
                  </li>
                  <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-sm shadow-md">
                      📊
                    </div>
                    <span className="text-card-foreground font-medium">
                      Visual progress reports
                    </span>
                  </li>
                  <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-sm shadow-md">
                      💡
                    </div>
                    <span className="text-card-foreground font-medium">
                      Skill recommendations
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Teacher Features */}
            <Card className="group relative p-10 rounded-3xl bg-card/70 backdrop-blur-xl border border-border shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-secondary/30 via-secondary/10 to-transparent"></div>
              <CardContent className="relative">
                <div className="w-16 h-16 bg-gradient-to-tr from-secondary/40 to-secondary/20 rounded-xl flex items-center justify-center mb-6 animate-bounce delay-200 group-hover:scale-110 transition-transform duration-500">
                  <Target className="h-8 w-8 text-secondary drop-shadow-lg" />
                </div>
                <h4 className="text-2xl font-bold mb-6 text-card-foreground">
                  For Teachers
                </h4>
                <ul className="space-y-4 text-left">
                  <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white text-sm shadow-md">
                      🖥️
                    </div>
                    <span className="text-card-foreground font-medium">
                      Class overview dashboard
                    </span>
                  </li>
                  <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white text-sm shadow-md">
                      🔍
                    </div>
                    <span className="text-card-foreground font-medium">
                      Detailed student analytics
                    </span>
                  </li>
                  <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white text-sm shadow-md">
                      📈
                    </div>
                    <span className="text-card-foreground font-medium">
                      Progress tracking tools
                    </span>
                  </li>
                  <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white text-sm shadow-md">
                      📤
                    </div>
                    <span className="text-card-foreground font-medium">
                      Exportable reports
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Parent Features */}
            <Card className="group relative p-10 rounded-3xl bg-card/70 backdrop-blur-xl border border-border shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-accent/30 via-accent/10 to-transparent"></div>
              <CardContent className="relative">
                <div className="w-16 h-16 bg-gradient-to-tr from-accent/40 to-accent/20 rounded-xl flex items-center justify-center mb-6 animate-bounce delay-500 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="h-8 w-8 text-accent drop-shadow-lg" />
                </div>
                <h4 className="text-2xl font-bold mb-6 text-card-foreground">
                  For Parents
                </h4>
                <ul className="space-y-4 text-left">
                  <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-white text-sm shadow-md">
                      👨‍👩‍👧
                    </div>
                    <span className="text-card-foreground font-medium">
                      Child progress summary
                    </span>
                  </li>
                  <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-white text-sm shadow-md">
                      🔎
                    </div>
                    <span className="text-card-foreground font-medium">
                      Actionable learning insights
                    </span>
                  </li>
                  <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-white text-sm shadow-md">
                      🤝
                    </div>
                    <span className="text-card-foreground font-medium">
                      Personalized support tips
                    </span>
                  </li>
                  <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-white text-sm shadow-md">
                      📑
                    </div>
                    <span className="text-card-foreground font-medium">
                      Simple, transparent reports
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
