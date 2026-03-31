import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  return (
    <div className="auth-bg min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[340px]">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-5 h-5 rounded-sm bg-[var(--accent-dim)] border border-[rgba(201,168,76,0.25)] flex items-center justify-center">
            <span className="rule-text text-accent" style={{ fontSize: 10, fontWeight: 700 }}>T</span>
          </div>
          <Link href="/" className="text-[14px] font-semibold tracking-tight text-primary">
            Trader
          </Link>
        </div>

        {/* Form card */}
        <div className="card-surface p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[17px] font-semibold text-primary tracking-tight">Create account</h2>
            <p className="text-[12px] text-muted">Start building your strategy playbook.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Your name" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
          </div>

          <Button variant="primary" className="w-full">Create account</Button>

          <p className="text-[11px] text-muted text-center">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-secondary hover:text-primary transition-colors">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
