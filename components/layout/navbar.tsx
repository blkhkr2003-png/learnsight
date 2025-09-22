import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

export function Navbar() {
  return (
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
  );
}
