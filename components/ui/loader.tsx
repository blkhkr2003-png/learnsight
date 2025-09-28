"use client";

// components/ui/loader.tsx
import { BarChart3 } from "lucide-react"; // or any icon you like

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 bg-gradient-to-b from-background to-muted/30 rounded-lg p-6">
      {/* Graphic Icon */}
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
        <BarChart3 className="w-8 h-8 text-primary animate-bounce" />
      </div>

      {/* Text with gradient + shimmer */}
      <p className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-pulse">
        Loading your dashboard…
      </p>

      {/* Optional subtext */}
      <p className="text-xs text-muted-foreground">
        Preparing your stats & progress ✨
      </p>
    </div>
  );
}
