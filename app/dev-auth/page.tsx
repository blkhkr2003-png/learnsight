"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { ShieldCheck, Copy } from "lucide-react";

export default function DevAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const auth = getAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email ?? null);
        setUserId(user.uid ?? null);
        const t = await user.getIdToken();
        setToken(t);
      } else {
        setUserEmail(null);
        setUserId(null);
        setToken(null);
      }
    });
    return () => unsub();
  }, [auth]);

  const handleCopy = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/4 h-72 w-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 h-72 w-72 bg-accent/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-2xl">
          <Card className="shadow-xl backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl transition-all duration-500 hover:shadow-primary/40">
            <CardHeader className="text-center space-y-4 pt-10">
              <div className="flex justify-center">
                <ShieldCheck className="h-14 w-14 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight text-white">
                Developer Authentication
              </CardTitle>
              <CardDescription className="text-base text-gray-400 max-w-md mx-auto leading-relaxed">
                Sign in with your developer credentials to securely generate a
                Firebase ID token for API testing and development.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 p-10">
              {!userEmail ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="font-medium text-gray-300"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="dev@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 text-white border-white/20 focus-visible:ring-primary placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="font-medium text-gray-300"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/10 text-white border-white/20 focus-visible:ring-primary placeholder:text-gray-500"
                    />
                  </div>

                  <Button
                    className="w-full h-12 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <p className="text-base text-gray-300">
                    You are signed in as{" "}
                    <span className="font-semibold text-primary">
                      {userEmail}
                    </span>
                    .
                  </p>
                  {userId && (
                    <p className="text-sm text-gray-400">
                      <span className="font-semibold">User ID:</span>{" "}
                      <span className="font-mono">{userId}</span>
                    </p>
                  )}
                  <Button
                    className="w-full h-12 text-lg font-semibold"
                    variant="secondary"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </Button>
                </div>
              )}

              {token && (
                <div className="space-y-4 pt-8 relative">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-gray-300">
                      Firebase ID Token
                    </Label>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-white/10 text-gray-200 hover:bg-white/20 transition"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <Textarea
                    value={token}
                    readOnly
                    className="h-64 font-mono text-xs p-4 resize-none bg-white/5 border-dashed border-white/20 text-gray-200 overflow-hidden"
                  />

                  <p className="text-xs text-gray-400 leading-relaxed">
                    <span className="font-semibold">Note:</span> Copy this token
                    for your API calls (e.g., in Postman). It will expire in
                    approximately one hour.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
