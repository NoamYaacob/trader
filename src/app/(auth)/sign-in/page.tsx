"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/server/actions/auth";

export default function SignInPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signInAction({ email, password });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[340px]">

        <div className="flex items-center gap-2 mb-8">
          <div className="w-5 h-5 rounded-sm bg-[var(--accent-dim)] border border-[rgba(201,168,76,0.25)] flex items-center justify-center">
            <span className="rule-text text-accent" style={{ fontSize: 10, fontWeight: 700 }}>T</span>
          </div>
          <Link href="/" className="text-[14px] font-semibold tracking-tight text-primary">
            Trader
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="card-surface p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[17px] font-semibold text-primary tracking-tight">Sign in</h2>
            <p className="text-[12px] text-muted">Continue to your strategy platform.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-invalid leading-snug">{error}</p>
          )}

          <Button variant="primary" type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in…" : "Sign in"}
          </Button>

          <p className="text-[11px] text-muted text-center">
            No account?{" "}
            <Link href="/sign-up" className="text-secondary hover:text-primary transition-colors">
              Sign up
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
}
