// components/ui/loader.tsx
export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      {/* Spinner */}
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />

      {/* Text with shimmer */}
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Loading your dashboard…
      </p>
    </div>
  );
}
