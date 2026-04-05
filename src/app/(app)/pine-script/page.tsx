import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { PineScriptView } from "@/components/playbook/pine-script-view";
import { getLatestStrategy } from "@/features/strategy";
import { getLatestPlaybook } from "@/features/playbook/data/playbook";

export default async function PineScriptPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId   = session.user.id;
  const strategy = await getLatestStrategy(userId);

  if (!strategy || strategy.status === "DRAFT") {
    redirect("/onboarding");
  }

  // Still generating — show a waiting state.
  if (strategy.status === "SUBMITTED" || strategy.status === "PROCESSING") {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="Pine Script" subtitle="generating…" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center flex flex-col items-center gap-4 max-w-[380px]">
            <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-[13px] text-secondary leading-relaxed">
              Your Pine Script indicator is being generated. Check back in a moment.
            </p>
            <a
              href="/pine-script"
              className="text-[12px] text-accent hover:text-primary transition-colors font-mono mt-2"
            >
              Refresh →
            </a>
          </div>
        </div>
      </div>
    );
  }

  const playbook = await getLatestPlaybook(strategy.id, userId);

  // No playbook yet or generation failed.
  if (!playbook) {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="Pine Script" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center flex flex-col items-center gap-3 max-w-[380px]">
            <p className="text-[15px] font-semibold text-primary">No playbook found</p>
            <p className="text-[13px] text-secondary leading-relaxed">
              Complete your strategy intake to generate a playbook and Pine Script indicator.
            </p>
            <a
              href="/onboarding"
              className="text-[12px] text-accent hover:text-primary transition-colors font-mono"
            >
              Start intake →
            </a>
          </div>
        </div>
      </div>
    );
  }

  const subtitle = `v${playbook.version} · ${playbook.status.toLowerCase()}`;

  // Playbook exists but no Pine Script was generated (strategy too ambiguous).
  if (!playbook.pineScript) {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="Pine Script" subtitle={subtitle} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 max-w-[440px] text-center px-4">
            <div className="w-10 h-10 rounded-full border border-border bg-elevated flex items-center justify-center">
              <span className="text-[18px] text-muted font-mono">/</span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-primary mb-1">
                Pine Script could not be generated
              </p>
              <p className="text-[13px] text-secondary leading-relaxed">
                Your strategy&apos;s entry conditions are too discretionary or ambiguous
                to translate into reliable Pine Script code.
              </p>
            </div>
            {playbook.pineScriptNotes && (
              <div className="w-full text-left px-3 py-3 rounded border border-border bg-elevated">
                <p className="text-[11px] text-muted font-mono uppercase tracking-wider mb-2">
                  AI notes
                </p>
                {playbook.pineScriptNotes.split("\n").filter(Boolean).map((note, i) => (
                  <p key={i} className="text-[12px] text-secondary leading-relaxed">
                    {note}
                  </p>
                ))}
              </div>
            )}
            <a
              href="/strategy/edit"
              className="text-[12px] text-accent hover:text-primary transition-colors font-mono"
            >
              Edit strategy intake →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Pine Script" subtitle={subtitle} />
      <div className="flex-1 overflow-y-auto">
        <PineScriptView
          pineScript={playbook.pineScript}
          pineScriptNotes={playbook.pineScriptNotes}
          version={playbook.version}
        />
      </div>
    </div>
  );
}
