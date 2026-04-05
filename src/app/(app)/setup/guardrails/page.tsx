import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { getActiveAccount, getGuardrails } from "@/features/prop-guard/data/prop-guard";
import { saveGuardrails } from "@/server/actions/prop-guard";

export default async function GuardrailsSetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId  = session.user.id;
  const account = await getActiveAccount(userId);
  if (!account) redirect("/setup/firm");

  const existing = await getGuardrails(account.id, userId);

  const field = (label: string, name: string, hint: string, opts?: { type?: string; min?: number; defaultValue?: number | null; placeholder?: string }) => (
    <div className="flex flex-col gap-1.5" key={name}>
      <label className="text-[11px] text-muted font-mono uppercase tracking-wider">{label}</label>
      <input
        type={opts?.type ?? "number"} name={name}
        min={opts?.min ?? 0} step="1"
        defaultValue={opts?.defaultValue ?? ""}
        placeholder={opts?.placeholder ?? "leave blank to skip"}
        className="bg-elevated border border-border rounded px-3 py-2.5 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-accent"
      />
      <p className="text-[11px] text-muted">{hint}</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Personal Guardrails" subtitle="step 3 of 3" />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[560px] mx-auto px-4 py-8 flex flex-col gap-8">

          <div>
            <h2 className="text-[15px] font-semibold text-primary">Define your personal guardrails</h2>
            <p className="text-[13px] text-secondary mt-1 leading-relaxed">
              These rules protect you from yourself. Leave any field blank to skip that rule.
              Your personal limits can be tighter than your firm&apos;s rules but cannot exceed them.
            </p>
          </div>

          <form action={saveGuardrails} className="flex flex-col gap-6">

            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] text-muted font-mono uppercase tracking-wider border-b border-border pb-1.5">Loss protection</p>
            </div>

            {field("Personal daily loss limit ($)", "maxDailyLoss",
              `Firm limit: $${account.dailyLossLimit.toLocaleString()}. Set a tighter personal limit here.`,
              { defaultValue: existing?.maxDailyLoss ?? null })}

            {field("Max consecutive losses", "maxConsecutiveLosses",
              "Stop trading after this many losses in a row. Recommended: 3.",
              { defaultValue: existing?.maxConsecutiveLosses ?? null })}

            {field("Cooldown after a loss (minutes)", "cooldownAfterLossMin",
              "Mandatory wait time before the next trade after a losing trade.",
              { defaultValue: existing?.cooldownAfterLossMin ?? null })}

            <div className="flex flex-col gap-1.5 pt-2">
              <p className="text-[11px] text-muted font-mono uppercase tracking-wider border-b border-border pb-1.5">Trade frequency</p>
            </div>

            {field("Max trades per day", "maxTradesPerDay",
              "Hard limit on total trades for the session.",
              { defaultValue: existing?.maxTradesPerDay ?? null })}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted font-mono uppercase tracking-wider">Max trades (burst)</label>
                <input type="number" name="maxTradesCount" min="1" step="1"
                  defaultValue={existing?.maxTradesCount ?? ""}
                  placeholder="e.g. 3"
                  className="bg-elevated border border-border rounded px-3 py-2.5 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted font-mono uppercase tracking-wider">Within (minutes)</label>
                <input type="number" name="maxTradesWindowMin" min="1" step="1"
                  defaultValue={existing?.maxTradesWindowMin ?? ""}
                  placeholder="e.g. 5"
                  className="bg-elevated border border-border rounded px-3 py-2.5 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted -mt-3">Rapid-fire warning: triggers if you place N trades in X minutes.</p>

            {field("No trades after hour (24h)", "noTradeAfterHour",
              "Stop trading after this hour in exchange time. E.g. 15 = no trades after 3:00 PM ET.",
              { defaultValue: existing?.noTradeAfterHour ?? null, min: 0, placeholder: "e.g. 15" })}

            <div className="flex flex-col gap-1.5 pt-2">
              <p className="text-[11px] text-muted font-mono uppercase tracking-wider border-b border-border pb-1.5">Discipline toggles</p>
            </div>

            {[
              { name: "noSizeIncreaseAfterLoss", label: "No size increase after a loss", desc: "Prevents revenge-trading with larger size after losing trades.", defaultChecked: existing?.noSizeIncreaseAfterLoss ?? false },
              { name: "payoutModeEnabled",       label: "Payout protection mode",        desc: "Activates tighter guardrails when protecting a payout window.", defaultChecked: existing?.payoutModeEnabled ?? false },
            ].map((toggle) => (
              <label key={toggle.name} className="flex items-start gap-3 px-3 py-3 rounded border border-border bg-elevated cursor-pointer hover:border-border-strong has-[:checked]:border-accent/50 has-[:checked]:bg-[var(--accent-dim)]">
                <input type="checkbox" name={toggle.name} defaultChecked={toggle.defaultChecked} className="mt-0.5 accent-[var(--accent)]" />
                <div>
                  <p className="text-[13px] text-primary">{toggle.label}</p>
                  <p className="text-[11px] text-muted mt-0.5">{toggle.desc}</p>
                </div>
              </label>
            ))}

            <button type="submit" className="w-full py-3 rounded bg-accent text-[var(--bg-base)] font-semibold text-[13px] hover:opacity-90 transition-opacity">
              Save guardrails and go to dashboard →
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
