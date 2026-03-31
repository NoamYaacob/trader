import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
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
            <h2 className="text-[18px] font-semibold text-primary tracking-tight">Create account</h2>
            <p className="text-[13px] text-secondary mt-1">Start building your strategy playbook.</p>
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

          <Button variant="primary" className="w-full">
            Create account
          </Button>

          <p className="text-[12px] text-muted text-center">
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
