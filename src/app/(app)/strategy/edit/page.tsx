import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveStrategy } from "@/features/strategy";
import { IntakeEditForm } from "@/components/strategy/intake-edit-form";

export default async function EditIntakePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId   = session.user.id;
  const strategy = await getActiveStrategy(userId);

  // Only ACTIVE strategies can be edited here.
  // Draft strategies use the /onboarding flow.
  if (!strategy) {
    redirect("/playbook");
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Minimal header — matches onboarding chrome */}
      <div className="border-b border-border px-8 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-[var(--accent-dim)] border border-[rgba(201,168,76,0.25)] flex items-center justify-center">
            <span className="rule-text text-accent" style={{ fontSize: 10, fontWeight: 700 }}>T</span>
          </div>
          <span className="text-[14px] font-semibold tracking-tight text-primary">
            Edit Strategy Intake
          </span>
        </div>
        <a
          href="/playbook"
          className="text-[12px] text-muted hover:text-secondary transition-colors font-mono"
        >
          ← Back to playbook
        </a>
      </div>

      <div className="flex-1 flex items-start justify-center">
        <IntakeEditForm strategy={strategy} />
      </div>
    </div>
  );
}
