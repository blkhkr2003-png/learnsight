import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Target, TrendingUp, Users, BarChart3 } from "lucide-react";
import Link from "next/link";
// import "./globals.css";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">LearnSight</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              How it Works
            </Link>
            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Adaptive Diagnostics,{" "}
              <span className="text-primary">Personalized Practice</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              Transform learning with AI-powered diagnostics that identify
              strengths and gaps across four key fundamentals: listening,
              comprehension, retention, and application.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/login?role=student">
                <Target className="mr-2 h-5 w-5" />
                Login as Student
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 bg-transparent"
              asChild
            >
              <Link href="/login?role=teacher">
                <Users className="mr-2 h-5 w-5" />
                Login as Teacher
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
              asChild
            >
              <Link href="/login?role=parent">
                {" "}
                <BarChart3 className="mr-2 h-5 w-5" />
                Login as Parent
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Four Learning Fundamentals
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive assessment and practice for complete learning
              mastery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold">👂</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Listening Skills</h3>
              <p className="text-gray-600">
                Assess and improve auditory processing and comprehension
                abilities
              </p>
            </div>

            <div className="text-center p-6 bg-teal-50 rounded-xl">
              <div className="w-12 h-12 bg-teal-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold">🧠</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Grasping Power</h3>
              <p className="text-gray-600">
                Evaluate comprehension speed and depth of understanding
              </p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold">💭</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Retention Power</h3>
              <p className="text-gray-600">
                Measure memory strength and information recall capabilities
              </p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="w-12 h-12 bg-green-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Practice Application
              </h3>
              <p className="text-gray-600">
                Test practical application and concept transfer skills
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-foreground mb-4">
              How LearnSight Works
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to unlock personalized learning insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-border bg-card">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold mb-4 text-card-foreground">
                  1. Take Diagnostic
                </h4>
                <p className="text-muted-foreground">
                  Complete an adaptive assessment that adjusts to your
                  responses, identifying your unique learning profile across
                  four key areas.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-border bg-card">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-8 w-8 text-secondary" />
                </div>
                <h4 className="text-2xl font-semibold mb-4 text-card-foreground">
                  2. Get Insights
                </h4>
                <p className="text-muted-foreground">
                  Receive detailed analytics showing your strengths in
                  listening, comprehension, retention, and application skills.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-border bg-card">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <h4 className="text-2xl font-semibold mb-4 text-card-foreground">
                  3. Practice & Improve
                </h4>
                <p className="text-muted-foreground">
                  Access personalized practice exercises designed to strengthen
                  your specific areas for improvement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-foreground mb-4">
              Built for Everyone
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tailored experiences for students, teachers, and parents
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Student Features */}
            <Card className="p-8 border-border bg-card">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold mb-4 text-card-foreground">
                  For Students
                </h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    Adaptive diagnostic tests
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    Personalized practice queue
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    Visual progress reports
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    Skill recommendations
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Teacher Features */}
            <Card className="p-8 border-border bg-card">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                  <Target className="h-6 w-6 text-secondary" />
                </div>
                <h4 className="text-2xl font-semibold mb-4 text-card-foreground">
                  For Teachers
                </h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    Class overview dashboard
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    Individual student analytics
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    Progress tracking tools
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    Exportable reports
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Parent Features */}
            <Card className="p-8 border-border bg-card">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h4 className="text-2xl font-semibold mb-4 text-card-foreground">
                  For Parents
                </h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                    Child progress summary
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                    Learning insights
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                    Support recommendations
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                    Simple, clear reports
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">
              LearnSight
            </span>
          </div>
          <p className="text-muted-foreground">
            Empowering personalized learning through adaptive diagnostics
          </p>
        </div>
      </footer>
    </div>
  );
}
