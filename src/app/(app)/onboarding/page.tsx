import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getDraftStrategy,
  createDraftStrategy,
} from "@/features/strategy/data/strategy";
import { IntakeForm } from "@/components/onboarding/intake-form";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;

  // If the user already has a submitted/active strategy, send them to the app.
  const existing = await getDraftStrategy(userId);
  if (existing?.status === "SUBMITTED" || existing?.status === "ACTIVE") {
    redirect("/playbook");
  }

  const strategy = existing ?? (await createDraftStrategy(userId));

  return (
    <div className="min-h-full flex flex-col">
      {/* Minimal header — no sidebar chrome for this focused flow */}
      <div className="border-b border-border px-8 h-14 flex items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-[var(--accent-dim)] border border-[rgba(201,168,76,0.25)] flex items-center justify-center">
            <span className="rule-text text-accent" style={{ fontSize: 10, fontWeight: 700 }}>T</span>
          </div>
          <span className="text-[14px] font-semibold tracking-tight text-primary">
            Strategy Intake
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center">
        <IntakeForm strategy={strategy} />
      </div>
    </div>
  );
}
