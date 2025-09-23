"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

type UserRole = "student" | "teacher" | "parent";

interface UserContextType {
  uid: string | null;
  role: UserRole;
  isApproved: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserContextType>({
    uid: null,
    role: "student",
    isApproved: false,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      // Start loading when auth state changes
      setState((prev) => ({ ...prev, loading: true }));

      try {
        if (user) {
          // Get ID token
          const idToken = await user.getIdToken();

          // Verify with server
          const res = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          if (res.ok) {
            const data = await res.json();
            setState({
              uid: user.uid,
              role: data.role as UserRole,
              isApproved: data.isApproved,
              loading: false,
            });
          } else {
            // Server rejected
            setState({
              uid: null,
              role: "student",
              isApproved: false,
              loading: false,
            });
          }
        } else {
          // Not logged in
          setState({
            uid: null,
            role: "student",
            isApproved: false,
            loading: false,
          });
        }
      } catch (err) {
        console.error("Auth error:", err);
        setState({
          uid: null,
          role: "student",
          isApproved: false,
          loading: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return <UserContext.Provider value={state}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
