import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-[360px]">

        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="text-[15px] font-bold tracking-tight text-primary">
            Trader
          </Link>
        </div>

        {/* Card */}
        <div className="card-surface p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-[18px] font-semibold text-primary tracking-tight">Sign in</h2>
            <p className="text-[13px] text-secondary mt-1">Continue to your strategy platform.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
          </div>

          <Button variant="primary" className="w-full">
            Sign in
          </Button>

          <p className="text-[12px] text-muted text-center">
            No account?{" "}
            <Link href="/sign-up" className="text-secondary hover:text-primary transition-colors">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
