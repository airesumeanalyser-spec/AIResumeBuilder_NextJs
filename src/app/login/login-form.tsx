"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Footer from "@/components/Footer";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get("next") || "/", [searchParams]);
  const err = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [message, setMessage] = useState<string | null>(err);

  const redirectTo = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=${encodeURIComponent(next)}`;

  async function signInGoogle() {
    setLoading("google");
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) setMessage(error.message);
    setLoading(null);
  }

  async function signInEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading("email");
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage(error.message);
      setLoading(null);
      return;
    }
    window.location.href = next;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-center">Sign in</h1>
        {message && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{message}</p>
        )}
        <button
          type="button"
          onClick={signInGoogle}
          disabled={loading !== null}
          className="w-full py-3 rounded-xl border border-gray-200 font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {loading === "google" ? "Redirecting…" : "Continue with Google"}
        </button>
        <div className="relative text-center text-sm text-gray-500">
          <span className="bg-white px-2 relative z-10">or email</span>
          <div className="absolute inset-x-0 top-1/2 border-t" />
        </div>
        <form onSubmit={signInEmail} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            required
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={loading !== null}
            className="w-full primary-button py-3 disabled:opacity-50"
          >
            {loading === "email" ? "Signing in…" : "Sign in with email"}
          </button>
        </form>
        <p className="text-xs text-center text-gray-500">
          Sign up via Supabase Auth (dashboard) or use Google OAuth.
        </p>
      </div>
      <Footer />
    </main>
  );
}
