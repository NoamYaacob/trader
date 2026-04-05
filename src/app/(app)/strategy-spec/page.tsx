import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { StrategySpecView } from "@/components/playbook/strategy-spec-view";
import { getLatestStrategy } from "@/features/strategy";
import { getLatestPlaybook } from "@/features/playbook/data/playbook";

export default async function StrategySpecPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId   = session.user.id;
  const strategy = await getLatestStrategy(userId);

  if (!strategy || strategy.status === "DRAFT") {
    redirect("/onboarding");
  }

  if (strategy.status === "SUBMITTED" || strategy.status === "PROCESSING") {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="Strategy Spec" subtitle="generating…" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center flex flex-col items-center gap-4 max-w-[380px]">
            <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-[13px] text-secondary leading-relaxed">
              Your strategy spec is being extracted. Check back in a moment.
            </p>
            <a href="/strategy-spec" className="text-[12px] text-accent hover:text-primary transition-colors font-mono mt-2">
              Refresh →
            </a>
          </div>
        </div>
      </div>
    );
  }

  const playbook = await getLatestPlaybook(strategy.id, userId);

  if (!playbook) {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="Strategy Spec" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center flex flex-col items-center gap-3 max-w-[380px]">
            <p className="text-[15px] font-semibold text-primary">No playbook found</p>
            <p className="text-[13px] text-secondary leading-relaxed">
              Complete your strategy intake to generate a playbook and spec.
            </p>
            <a href="/onboarding" className="text-[12px] text-accent hover:text-primary transition-colors font-mono">
              Start intake →
            </a>
          </div>
        </div>
      </div>
    );
  }

  const subtitle = `v${playbook.version} · ${playbook.status.toLowerCase()}`;

  // Playbook exists but was generated before the spec layer existed.
  if (!playbook.spec) {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="Strategy Spec" subtitle={subtitle} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 max-w-[440px] text-center px-4">
            <div className="w-10 h-10 rounded-full border border-border bg-elevated flex items-center justify-center">
              <span className="text-[16px] text-muted font-mono">~</span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-primary mb-1">
                No spec for this playbook version
              </p>
              <p className="text-[13px] text-secondary leading-relaxed">
                This playbook was generated before the strategy spec layer was introduced.
                Regenerate your playbook to produce a normalized spec.
              </p>
            </div>
            <a href="/strategy/edit" className="text-[12px] text-accent hover:text-primary transition-colors font-mono">
              Edit strategy intake →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Strategy Spec" subtitle={subtitle} />
      <div className="flex-1 overflow-y-auto">
        <StrategySpecView spec={playbook.spec} version={playbook.version} />
      </div>
    </div>
  );
}
