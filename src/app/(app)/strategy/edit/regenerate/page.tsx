import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveStrategy } from "@/features/strategy";
import { getLatestPlaybook } from "@/features/playbook/data/playbook";
import { RegenerateConfirmView } from "@/components/strategy/regenerate-confirm";

export default async function RegenerateConfirmPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId   = session.user.id;
  const strategy = await getActiveStrategy(userId);

  if (!strategy) {
    redirect("/playbook");
  }

  const playbook = await getLatestPlaybook(strategy.id, userId);

  // Can only regenerate from a CONFIRMED playbook.
  // If no playbook or it's still a DRAFT, send back.
  if (!playbook || playbook.status !== "CONFIRMED") {
    redirect("/playbook");
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Minimal header */}
      <div className="border-b border-border px-8 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-[var(--accent-dim)] border border-[rgba(201,168,76,0.25)] flex items-center justify-center">
            <span className="rule-text text-accent" style={{ fontSize: 10, fontWeight: 700 }}>T</span>
          </div>
          <span className="text-[14px] font-semibold tracking-tight text-primary">
            Regenerate Playbook
          </span>
        </div>
        <a
          href="/strategy/edit"
          className="text-[12px] text-muted hover:text-secondary transition-colors font-mono"
        >
          ← Back to intake
        </a>
      </div>

      <div className="flex-1 flex items-start justify-center">
        <RegenerateConfirmView
          playbookId={playbook.id}
          playbookVersion={playbook.version}
        />
      </div>
    </div>
  );
}
