"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { Brain } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "student" | "teacher" | "parent"; // single role
  allowedRoles?: string[]; // or multiple roles
}

export default function AuthGuard({
  children,
  requiredRole,
  allowedRoles,
}: AuthGuardProps) {
  const { uid, role, isApproved, loading } = useUser();
  const router = useRouter();

  // Combine requiredRole and allowedRoles into one array for easier checking
  const rolesToCheck = allowedRoles ?? (requiredRole ? [requiredRole] : []);

  useEffect(() => {
    if (!loading) {
      if (!uid) {
        router.push("/login");
      } else if (rolesToCheck.length && !rolesToCheck.includes(role)) {
        router.push("/login"); // or an unauthorized page
      } else if (!isApproved) {
        router.push("/support"); // pending approval page
      }
    }
  }, [uid, role, isApproved, loading, rolesToCheck, router]);

  // Show loading spinner/animation while checking auth
  if (loading || !uid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user passes all checks, render children
  return <>{children}</>;
}
