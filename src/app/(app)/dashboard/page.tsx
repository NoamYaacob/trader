import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import {
  getTraderProfile,
  getActiveAccount,
  getGuardrails,
  getTodaySession,
  getRecentSessions,
  computeSafetyState,
} from "@/features/prop-guard/data/prop-guard";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId  = session.user.id;
  const profile = await getTraderProfile(userId);
  if (!profile) redirect("/setup/trader");

  const account = await getActiveAccount(userId);
  if (!account) redirect("/setup/firm");

  const [guardrails, todaySession, recentSessions] = await Promise.all([
    getGuardrails(account.id, userId),
    getTodaySession(userId, account.id),
    getRecentSessions(userId, account.id, 5),
  ]);

  const safety = computeSafetyState(todaySession, account, guardrails);

  const statusColors = {
    SAFE:    { bg: "bg-valid/10",   border: "border-valid/30",   text: "text-valid",   dot: "bg-valid"   },
    WARNING: { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning", dot: "bg-warning" },
    DANGER:  { bg: "bg-invalid/10", border: "border-invalid/30", text: "text-invalid", dot: "bg-invalid"  },
  } as const;
  const sc = statusColors[safety.status];

  // Next risk trigger message
  let nextTrigger: string | null = null;
  if (safety.status !== "DANGER") {
    if (safety.tradesLimit != null) {
      const tradesLeft = safety.tradesLimit - safety.tradesCount;
      const lossLeft   = safety.lossRoomLeft;
      if (tradesLeft <= 2) {
        nextTrigger = `${tradesLeft} trade${tradesLeft !== 1 ? "s" : ""} until daily limit`;
      } else if (safety.lossPercent >= 50) {
        nextTrigger = `$${lossLeft.toLocaleString()} loss room remaining`;
      }
    } else if (safety.lossPercent >= 50) {
      nextTrigger = `$${safety.lossRoomLeft.toLocaleString()} loss room remaining`;
    }
  }

  // Firm-specific warnings
  const firmWarnings: string[] = [];
  if (account.eodFlatRule)      firmWarnings.push("EOD flat rule active — must close all positions by end of day");
  if (account.trailingDrawdown) firmWarnings.push("Trailing drawdown — max loss trails your account high-water mark");
  if (account.consistencyRule)  firmWarnings.push("Consistency rule — no single day can dominate your profit");

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Dashboard" subtitle={account.firmName} />

      <div className="flex-1 p-8 max-w-[1060px] w-full mx-auto space-y-5">

        {/* Safety status banner */}
        <div className={cn("rounded-lg border px-5 py-4 flex items-center gap-4", sc.bg, sc.border)}>
          <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", sc.dot)} />
          <div className="flex-1 min-w-0">
            <p className={cn("text-[15px] font-semibold", sc.text)}>
              {safety.status === "SAFE" && "Account safe"}
              {safety.status === "WARNING" && "Approaching limit — slow down"}
              {safety.status === "DANGER" && "Limit reached — stop trading"}
            </p>
            {nextTrigger && (
              <p className="text-[12px] text-secondary mt-0.5">{nextTrigger}</p>
            )}
          </div>
          {safety.payoutMode && (
            <span className="shrink-0 text-[10px] font-mono font-semibold px-2 py-1 rounded border border-accent/40 text-accent bg-[var(--accent-dim)]">
              PAYOUT MODE
            </span>
          )}
          <Link href="/session" className="shrink-0 text-[11px] font-mono text-secondary hover:text-primary transition-colors">
            {todaySession ? "Update session →" : "Start session →"}
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3">
          {/* Daily loss */}
          <div className="card-surface p-4 flex flex-col gap-2">
            <p className="label-section">Daily loss used</p>
            <p className={cn("text-[22px] font-semibold font-mono tabular-nums", safety.lossPercent >= 80 ? "text-invalid" : safety.lossPercent >= 50 ? "text-warning" : "text-primary")}>
              ${safety.dailyLossUsed.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", safety.lossPercent >= 80 ? "bg-invalid" : safety.lossPercent >= 50 ? "bg-warning" : "bg-valid")}
                  style={{ width: `${Math.min(safety.lossPercent, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-muted font-mono tabular-nums">{Math.round(safety.lossPercent)}%</span>
            </div>
            <p className="text-[11px] text-muted">limit ${safety.dailyLossLimit.toLocaleString()} · ${safety.lossRoomLeft.toLocaleString()} left</p>
          </div>

          {/* Trades */}
          <div className="card-surface p-4 flex flex-col gap-2">
            <p className="label-section">Trades today</p>
            <p className="text-[22px] font-semibold font-mono tabular-nums text-primary">
              {safety.tradesCount}
              {safety.tradesLimit != null && (
                <span className="text-[14px] text-muted font-normal"> / {safety.tradesLimit}</span>
              )}
            </p>
            {safety.tradesLimit != null && (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all",
                        safety.tradesCount >= safety.tradesLimit ? "bg-invalid" :
                        safety.tradesCount >= safety.tradesLimit * 0.8 ? "bg-warning" : "bg-valid"
                      )}
                      style={{ width: `${Math.min((safety.tradesCount / safety.tradesLimit) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted font-mono">
                    {Math.round((safety.tradesCount / safety.tradesLimit) * 100)}%
                  </span>
                </div>
                <p className="text-[11px] text-muted">
                  {Math.max(safety.tradesLimit - safety.tradesCount, 0)} trades remaining
                </p>
              </>
            )}
            {safety.tradesLimit == null && (
              <p className="text-[11px] text-muted">no daily limit set</p>
            )}
          </div>

          {/* Today P&L */}
          <div className="card-surface p-4 flex flex-col gap-2">
            <p className="label-section">Today&apos;s P&amp;L</p>
            <p className={cn("text-[22px] font-semibold font-mono tabular-nums",
              todaySession == null ? "text-muted" :
              todaySession.dailyPnl >= 0 ? "text-valid" : "text-invalid"
            )}>
              {todaySession == null
                ? "—"
                : `${todaySession.dailyPnl >= 0 ? "+" : ""}$${todaySession.dailyPnl.toLocaleString()}`
              }
            </p>
            <p className="text-[11px] text-muted">
              {todaySession ? `session ${todaySession.status.toLowerCase()}` : "no session started"}
            </p>
          </div>

          {/* Account */}
          <div className="card-surface p-4 flex flex-col gap-2">
            <p className="label-section">Account</p>
            <p className="text-[22px] font-semibold text-primary">
              ${(account.accountSize / 1000).toFixed(0)}k
            </p>
            <p className="text-[11px] text-muted truncate">{account.firmName} · {account.productType.toLowerCase()}</p>
          </div>
        </div>

        {/* Firm warnings */}
        {firmWarnings.length > 0 && (
          <div className="card-surface p-4 flex flex-col gap-2">
            <p className="label-section">Firm rules active</p>
            <div className="flex flex-col gap-1.5">
              {firmWarnings.map((w) => (
                <div key={w} className="flex items-start gap-2">
                  <span className="text-warning mt-0.5 text-[10px]">▲</span>
                  <p className="text-[12px] text-secondary">{w}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent sessions + discipline events */}
        <div className="grid grid-cols-2 gap-4">

          {/* Recent sessions */}
          <div className="card-surface p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="label-section">Recent Sessions</p>
              <Link href="/session" className="text-[11px] text-secondary hover:text-primary transition-colors font-mono">
                Today →
              </Link>
            </div>
            {recentSessions.length === 0 ? (
              <div className="flex flex-col gap-1 py-2">
                <p className="text-[13px] text-secondary">No sessions yet.</p>
                <p className="text-[11px] text-muted">Log today&apos;s trades to start tracking your discipline.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {recentSessions.map((s) => {
                  const dateStr = s.date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const pnlPos  = s.dailyPnl >= 0;
                  const ssColor = s.safetyStatus === "SAFE" ? "text-valid" : s.safetyStatus === "WARNING" ? "text-warning" : "text-invalid";
                  return (
                    <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded border border-border">
                      <span className={cn("text-[10px] font-mono font-semibold px-1 py-px rounded border shrink-0", ssColor,
                        s.safetyStatus === "SAFE" ? "border-valid/30" : s.safetyStatus === "WARNING" ? "border-warning/30" : "border-invalid/30"
                      )}>
                        {s.safetyStatus}
                      </span>
                      <p className="text-[12px] text-muted font-mono shrink-0">{dateStr}</p>
                      <p className={cn("text-[12px] font-semibold font-mono tabular-nums ml-auto shrink-0", pnlPos ? "text-valid" : "text-invalid")}>
                        {pnlPos ? "+" : ""}${s.dailyPnl.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-muted shrink-0">{s.tradesCount}T</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's events */}
          <div className="card-surface p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="label-section">Discipline Events Today</p>
              <Link href="/rules" className="text-[11px] text-secondary hover:text-primary transition-colors font-mono">
                View rules →
              </Link>
            </div>
            {!todaySession || todaySession.events.length === 0 ? (
              <div className="flex flex-col gap-1 py-2">
                <p className="text-[13px] text-secondary">No events logged.</p>
                <p className="text-[11px] text-muted">Events are recorded when you approach or breach a guardrail.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {todaySession.events.slice(-5).map((ev) => {
                  const sevColor = ev.severity === "CRITICAL" ? "text-invalid" : ev.severity === "WARNING" ? "text-warning" : "text-muted";
                  return (
                    <div key={ev.id} className="flex items-start gap-2.5 px-3 py-2 rounded border border-border">
                      <span className={cn("text-[10px] font-mono font-semibold shrink-0 mt-0.5", sevColor)}>
                        {ev.severity}
                      </span>
                      <p className="text-[12px] text-secondary flex-1 min-w-0">{ev.message}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
