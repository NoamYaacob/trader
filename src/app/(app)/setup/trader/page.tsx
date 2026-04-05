import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { getTraderProfile } from "@/features/prop-guard/data/prop-guard";
import { saveTraderProfile } from "@/server/actions/prop-guard";
import { TRADER_TYPE_LABELS, TRADER_GOAL_LABELS } from "@/features/prop-guard/types";

export default async function TraderProfileSetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const profile = await getTraderProfile(session.user.id);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Trader Profile" subtitle="step 1 of 3" />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[560px] mx-auto px-4 py-8 flex flex-col gap-8">

          <div>
            <h2 className="text-[15px] font-semibold text-primary">Tell us about how you trade</h2>
            <p className="text-[13px] text-secondary mt-1 leading-relaxed">
              This helps Prop Guard tailor guardrails and warnings to your trading style.
            </p>
          </div>

          <form action={saveTraderProfile} className="flex flex-col gap-6">

            {/* Trader type */}
            <fieldset className="flex flex-col gap-2">
              <legend className="text-[11px] text-muted font-mono uppercase tracking-wider mb-2">
                Trading style
              </legend>
              {(Object.entries(TRADER_TYPE_LABELS) as [string, string][]).map(([value, label]) => (
                <label key={value} className="flex items-center gap-3 px-4 py-3 rounded border border-border bg-elevated hover:border-border-strong cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-[var(--accent-dim)]">
                  <input type="radio" name="traderType" value={value} defaultChecked={profile?.traderType === value} required className="accent-[var(--accent)]" />
                  <span className="text-[13px] text-primary">{label}</span>
                </label>
              ))}
            </fieldset>

            {/* Goal */}
            <fieldset className="flex flex-col gap-2">
              <legend className="text-[11px] text-muted font-mono uppercase tracking-wider mb-2">
                Current goal
              </legend>
              {(Object.entries(TRADER_GOAL_LABELS) as [string, string][]).map(([value, label]) => (
                <label key={value} className="flex items-center gap-3 px-4 py-3 rounded border border-border bg-elevated hover:border-border-strong cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-[var(--accent-dim)]">
                  <input type="radio" name="goal" value={value} defaultChecked={profile?.goal === value} required className="accent-[var(--accent)]" />
                  <span className="text-[13px] text-primary">{label}</span>
                </label>
              ))}
            </fieldset>

            {/* Market + platform */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted font-mono uppercase tracking-wider">
                  Main market <span className="normal-case font-sans text-muted">(optional)</span>
                </label>
                <input
                  type="text" name="mainMarket"
                  defaultValue={profile?.mainMarket ?? ""}
                  placeholder="e.g. NQ, ES, CL, GC"
                  className="bg-elevated border border-border rounded px-3 py-2.5 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted font-mono uppercase tracking-wider">
                  Platform <span className="normal-case font-sans text-muted">(optional)</span>
                </label>
                <input
                  type="text" name="platform"
                  defaultValue={profile?.platform ?? ""}
                  placeholder="e.g. NinjaTrader, Rithmic, TradingView"
                  className="bg-elevated border border-border rounded px-3 py-2.5 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 rounded bg-accent text-[var(--bg-base)] font-semibold text-[13px] hover:opacity-90 transition-opacity">
              Continue to prop firm setup →
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
