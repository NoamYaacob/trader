import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import {
  getActiveAccount,
  getGuardrails,
} from "@/features/prop-guard/data/prop-guard";
import { cn } from "@/lib/utils";

export default async function RulesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId  = session.user.id;
  const account = await getActiveAccount(userId);
  if (!account) redirect("/setup/firm");

  const guardrails = await getGuardrails(account.id, userId);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Rules & Guardrails" subtitle={account.firmName} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[700px] mx-auto px-4 py-8 flex flex-col gap-8">

          {/* Firm rules */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-primary font-mono uppercase tracking-wider">Firm Rules</h2>
              <Link href="/setup/firm" className="text-[11px] text-muted hover:text-primary font-mono transition-colors">
                Edit →
              </Link>
            </div>

            <RuleRow
              label="Daily loss limit"
              value={`$${account.dailyLossLimit.toLocaleString()}`}
              desc="Maximum dollar loss allowed in a single trading day."
              active
            />
            <RuleRow
              label="Account size"
              value={`$${account.accountSize.toLocaleString()}`}
              desc={`${account.productType.toLowerCase()} account`}
              active
            />
            <RuleRow
              label="EOD flat rule"
              value={account.eodFlatRule ? "Enabled" : "Disabled"}
              desc="Must be flat (no open positions) by end of the trading day."
              active={account.eodFlatRule}
            />
            <RuleRow
              label="Trailing drawdown"
              value={account.trailingDrawdown ? "Enabled" : "Disabled"}
              desc="Maximum drawdown trails your account high-water mark."
              active={account.trailingDrawdown}
            />
            <RuleRow
              label="Consistency rule"
              value={account.consistencyRule ? "Enabled" : "Disabled"}
              desc="No single day can be a disproportionate share of total profit."
              active={account.consistencyRule}
            />
            <RuleRow
              label="Payout mode"
              value={account.payoutMode ? "Active" : "Inactive"}
              desc="Tighter restrictions are enforced when protecting a payout window."
              active={account.payoutMode}
            />
          </section>

          {/* Personal guardrails */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-primary font-mono uppercase tracking-wider">Personal Guardrails</h2>
              <Link href="/setup/guardrails" className="text-[11px] text-muted hover:text-primary font-mono transition-colors">
                Edit →
              </Link>
            </div>

            {!guardrails ? (
              <div className="rounded border border-border bg-elevated px-4 py-4 text-[13px] text-secondary">
                No personal guardrails set.{" "}
                <Link href="/setup/guardrails" className="text-accent hover:underline">
                  Set them up now →
                </Link>
              </div>
            ) : (
              <>
                <RuleRow
                  label="Personal daily loss limit"
                  value={guardrails.maxDailyLoss != null ? `$${guardrails.maxDailyLoss.toLocaleString()}` : "—"}
                  desc={`Tighter personal limit. Firm limit: $${account.dailyLossLimit.toLocaleString()}.`}
                  active={guardrails.maxDailyLoss != null}
                />
                <RuleRow
                  label="Max consecutive losses"
                  value={guardrails.maxConsecutiveLosses != null ? String(guardrails.maxConsecutiveLosses) : "—"}
                  desc="Stop trading after this many losses in a row."
                  active={guardrails.maxConsecutiveLosses != null}
                />
                <RuleRow
                  label="Cooldown after loss"
                  value={guardrails.cooldownAfterLossMin != null ? `${guardrails.cooldownAfterLossMin} min` : "—"}
                  desc="Mandatory wait before the next trade after a losing trade."
                  active={guardrails.cooldownAfterLossMin != null}
                />
                <RuleRow
                  label="Max trades per day"
                  value={guardrails.maxTradesPerDay != null ? String(guardrails.maxTradesPerDay) : "—"}
                  desc="Hard limit on total trades for the session."
                  active={guardrails.maxTradesPerDay != null}
                />
                {(guardrails.maxTradesCount != null || guardrails.maxTradesWindowMin != null) && (
                  <RuleRow
                    label="Rapid-fire limit"
                    value={
                      guardrails.maxTradesCount != null && guardrails.maxTradesWindowMin != null
                        ? `${guardrails.maxTradesCount} trades / ${guardrails.maxTradesWindowMin} min`
                        : "—"
                    }
                    desc="Warning triggers if you place N trades within X minutes."
                    active={guardrails.maxTradesCount != null && guardrails.maxTradesWindowMin != null}
                  />
                )}
                <RuleRow
                  label="No trades after hour"
                  value={guardrails.noTradeAfterHour != null ? `${guardrails.noTradeAfterHour}:00 ET` : "—"}
                  desc="Stop trading after this hour in exchange time."
                  active={guardrails.noTradeAfterHour != null}
                />
                <RuleRow
                  label="No size increase after loss"
                  value={guardrails.noSizeIncreaseAfterLoss ? "Enabled" : "Disabled"}
                  desc="Prevents revenge-trading with larger size after a losing trade."
                  active={guardrails.noSizeIncreaseAfterLoss}
                />
                <RuleRow
                  label="Payout protection mode"
                  value={guardrails.payoutModeEnabled ? "Enabled" : "Disabled"}
                  desc="Activates tighter guardrails when protecting a payout window."
                  active={guardrails.payoutModeEnabled}
                />
              </>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

function RuleRow({
  label,
  value,
  desc,
  active,
}: {
  label: string;
  value: string;
  desc: string;
  active: boolean;
}) {
  return (
    <div className={cn(
      "rounded border px-4 py-3 flex items-start gap-4",
      active ? "border-border bg-elevated" : "border-border/50 bg-elevated/50"
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("text-[12px] font-semibold", active ? "text-primary" : "text-muted")}>{label}</p>
          {!active && (
            <span className="text-[9px] font-mono text-muted px-1 py-px border border-border rounded">off</span>
          )}
        </div>
        <p className="text-[11px] text-muted mt-0.5">{desc}</p>
      </div>
      <p className={cn(
        "text-[13px] font-semibold font-mono tabular-nums shrink-0 mt-0.5",
        active ? "text-primary" : "text-muted"
      )}>
        {value}
      </p>
    </div>
  );
}
