// app/login/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import type { UserDoc, Role } from "@/types";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

/* --- component --- */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Mail, Lock, User } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "";

  useEffect(() => {
    if (defaultRole) setRole(defaultRole as Role);
  }, [defaultRole]);

  const errorMessage = (err: unknown) =>
    err && typeof err === "object" && "message" in err
      ? (err as any).message
      : String(err);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // If not approved, we can show a message or route to a waiting page
      if (!data.isApproved) {
        alert("Your account is waiting for admin approval.");
        setIsLoading(false);
        return;
      }

      router.push(`/${data.role}/dashboard`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const userRole = "student"; // Google signup only allows student for now
        const isApproved = userRole === "student"; // true only for student

        const userData: Partial<UserDoc> = {
          uid: user.uid,
          name: user.displayName ?? "",
          email: user.email ?? "",
          role: userRole,
          isApproved,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };

        await setDoc(userRef, userData);
      } else {
        await setDoc(
          userRef,
          {
            lastLogin: serverTimestamp(),
            isApproved:
              userDoc.data()?.isApproved ?? userDoc.data()?.role === "student",
          },
          { merge: true }
        );
      }

      router.push("/student/dashboard");
    } catch (error: any) {
      console.error("Google login failed:", errorMessage(error));
      alert("Google login failed: " + errorMessage(error));
    } finally {
      ``;
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!role) {
      alert("Please select a role to continue.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          role,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (!data.isApproved) {
        alert(
          "Your registration was successful! Admin approval is required to activate your profile."
        );
      }
      router.push(`/${role}/dashboard`);
    } catch (err: any) {
      alert("Signup failed: " + errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = () => {
    setLoginEmail("");
    setLoginPassword("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupName("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              LearnSight
            </span>
          </Link>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-card-foreground">
              Get Started
            </CardTitle>
            <CardDescription className="text-center">
              Choose your role and access your personalized dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="login"
              className="w-full"
              onValueChange={handleTabChange}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 pt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-login">I am a...</Label>
                    <Select
                      value={role}
                      onValueChange={(value) => setRole(value as Role)}
                      required
                    >
                      {" "}
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email-login"
                        type="email"
                        placeholder="Enter your email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                        required
                        autoComplete="username"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-login">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password-login"
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                        required
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C36.17 2.55 30.47 0 24 0 14.62 0 6.5 5.92 2.58 14.55l7.96 6.18C12.24 13.72 17.62 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.15 24.5c0-1.57-.14-3.08-.39-4.5H24v9h12.65c-.55 2.98-2.18 5.49-4.64 7.18l7.3 5.68C43.79 38.64 46.15 31.97 46.15 24.5z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.54 28.73A14.48 14.48 0 019.5 24c0-1.64.3-3.21.84-4.73l-7.96-6.18C.86 15.68 0 19.74 0 24c0 4.26.86 8.32 2.38 11.91l8.16-6.18z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.9-2.13 15.87-5.81l-7.3-5.68c-2.02 1.35-4.61 2.14-8.57 2.14-6.38 0-11.76-4.22-13.46-9.95l-8.16 6.18C6.5 42.08 14.62 48 24 48z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 pt-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-signup">I am a...</Label>
                    <Select
                      value={role}
                      onValueChange={(value) => setRole(value as Role)}
                      required
                    >
                      {" "}
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name-signup">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name-signup"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="pl-10"
                        required
                        autoComplete="name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email-signup"
                        type="email"
                        placeholder="Enter your email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10"
                        required
                        autoComplete="username"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password-signup"
                        type="password"
                        placeholder="Create a password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10"
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4 border-border bg-muted/30">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-sm text-card-foreground mb-2">
              Demo Credentials
            </h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Student:</strong> ram@demo.com / password
              </p>
              <p>
                <strong>Teacher:</strong> teacher@demo.com / password
              </p>
              <p>
                <strong>Parent:</strong> parent@demo.com / password
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
