"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "student" | "teacher" | "parent";
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // TODO: Implement Firebase Auth state listener
    // const auth = getAuth()
    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   if (user) {
    //     // Check user role from custom claims or database
    //     setIsAuthenticated(true)
    //   } else {
    //     router.push('/login')
    //   }
    //   setIsLoading(false)
    // })

    // Simulate auth check
    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // For demo purposes, assume user is authenticated
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
