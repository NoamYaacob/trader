import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import {
  getActiveAccount,
  getGuardrails,
  getTodaySession,
  computeSafetyState,
} from "@/features/prop-guard/data/prop-guard";
import { upsertTodaySession, completeSession, logManualNote } from "@/server/actions/prop-guard";
import { DISCIPLINE_EVENT_LABELS } from "@/features/prop-guard/types";
import { cn } from "@/lib/utils";

export default async function SessionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId  = session.user.id;
  const account = await getActiveAccount(userId);
  if (!account) redirect("/setup/firm");

  const [guardrails, todaySession] = await Promise.all([
    getGuardrails(account.id, userId),
    getTodaySession(userId, account.id),
  ]);

  const safety = computeSafetyState(todaySession, account, guardrails);
  const isCompleted = todaySession?.status === "COMPLETED";

  const severityColors = {
    INFO:     "text-muted border-border",
    WARNING:  "text-warning border-warning/30",
    CRITICAL: "text-invalid border-invalid/30",
  } as const;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Today's Session"
        subtitle={
          isCompleted
            ? `Completed · score ${todaySession?.disciplineScore ?? "—"}`
            : todaySession
            ? "Active session"
            : "No session started"
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[640px] mx-auto px-4 py-8 flex flex-col gap-8">

          {/* Log / update session form */}
          {!isCompleted && (
            <section className="flex flex-col gap-4">
              <h2 className="text-[13px] font-semibold text-primary font-mono uppercase tracking-wider">
                {todaySession ? "Update session" : "Start today's session"}
              </h2>

              <form action={upsertTodaySession} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-muted font-mono uppercase tracking-wider">
                      Trades taken
                    </label>
                    <input
                      type="number" name="tradesCount" min="0" step="1"
                      defaultValue={todaySession?.tradesCount ?? 0}
                      className="bg-elevated border border-border rounded px-3 py-2.5 text-[13px] text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-muted font-mono uppercase tracking-wider">
                      P&amp;L ($)
                    </label>
                    <input
                      type="number" name="dailyPnl" step="0.01"
                      defaultValue={todaySession?.dailyPnl ?? 0}
                      placeholder="negative = loss"
                      className="bg-elevated border border-border rounded px-3 py-2.5 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-muted font-mono uppercase tracking-wider">
                    Notes <span className="normal-case font-sans">(optional)</span>
                  </label>
                  <textarea
                    name="notes" rows={2}
                    defaultValue={todaySession?.notes ?? ""}
                    placeholder="Any session notes…"
                    className="bg-elevated border border-border rounded px-3 py-2.5 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-accent text-[var(--bg-base)] font-semibold text-[13px] hover:opacity-90 transition-opacity"
                >
                  {todaySession ? "Update session" : "Start session"}
                </button>
              </form>
            </section>
          )}

          {/* Safety state summary */}
          {todaySession && (
            <section className="flex flex-col gap-3">
              <h2 className="text-[13px] font-semibold text-primary font-mono uppercase tracking-wider">Safety summary</h2>

              <div className="grid grid-cols-3 gap-3">
                <StatBox label="Loss used" value={`$${safety.dailyLossUsed.toLocaleString()}`} sub={`${Math.round(safety.lossPercent)}% of limit`} warn={safety.lossPercent >= 50} danger={safety.lossPercent >= 80} />
                <StatBox label="Loss room" value={`$${safety.lossRoomLeft.toLocaleString()}`} sub={`limit $${safety.dailyLossLimit.toLocaleString()}`} />
                <StatBox label="Trades" value={String(safety.tradesCount)} sub={safety.tradesLimit != null ? `of ${safety.tradesLimit}` : "no limit"} />
              </div>

              {isCompleted && (
                <div className="grid grid-cols-2 gap-3">
                  <StatBox label="Discipline score" value={todaySession.disciplineScore != null ? `${todaySession.disciplineScore}` : "—"} sub="out of 100" />
                  <StatBox label="Payout safety" value={todaySession.payoutSafetyScore != null ? `${todaySession.payoutSafetyScore}` : "—"} sub="out of 100" />
                </div>
              )}
            </section>
          )}

          {/* Discipline events */}
          {todaySession && (
            <section className="flex flex-col gap-3">
              <h2 className="text-[13px] font-semibold text-primary font-mono uppercase tracking-wider">
                Discipline events
                {todaySession.events.length > 0 && (
                  <span className="ml-2 text-[11px] font-normal text-muted">({todaySession.events.length})</span>
                )}
              </h2>

              {todaySession.events.length === 0 ? (
                <p className="text-[13px] text-muted py-2">No events logged for this session.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {todaySession.events.map((ev) => {
                    const timeStr = ev.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                    const sc = severityColors[ev.severity];
                    return (
                      <div key={ev.id} className={cn("flex items-start gap-3 px-3 py-2.5 rounded border", sc)}>
                        <div className="flex flex-col min-w-0 flex-1">
                          <p className="text-[11px] font-mono font-semibold text-muted">{DISCIPLINE_EVENT_LABELS[ev.type]}</p>
                          <p className="text-[13px] text-secondary mt-0.5">{ev.message}</p>
                        </div>
                        <p className="text-[10px] text-muted font-mono shrink-0 mt-0.5">{timeStr}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Manual note */}
              {!isCompleted && (
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const msg = (formData.get("message") as string | null)?.trim();
                    if (msg && todaySession) await logManualNote(todaySession.id, msg);
                    redirect("/session");
                  }}
                  className="flex gap-2 pt-1"
                >
                  <input
                    type="text" name="message"
                    placeholder="Add a manual note…"
                    className="flex-1 bg-elevated border border-border rounded px-3 py-2 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-accent"
                  />
                  <button type="submit" className="px-3 py-2 rounded border border-border text-[12px] text-secondary hover:text-primary hover:border-border-strong transition-colors">
                    Add
                  </button>
                </form>
              )}
            </section>
          )}

          {/* Complete session */}
          {todaySession && !isCompleted && (
            <section>
              <form
                action={async () => {
                  "use server";
                  if (todaySession) await completeSession(todaySession.id);
                }}
              >
                <button
                  type="submit"
                  className="w-full py-2.5 rounded border border-border text-[13px] text-secondary hover:text-primary hover:border-border-strong transition-colors"
                >
                  Complete session and calculate scores
                </button>
              </form>
            </section>
          )}

          {/* No session CTA */}
          {!todaySession && (
            <div className="rounded border border-border bg-elevated px-5 py-5 text-center flex flex-col gap-2">
              <p className="text-[13px] text-secondary">No session logged for today.</p>
              <p className="text-[11px] text-muted">Log your trades and P&amp;L above to start tracking your discipline.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StatBox({
  label, value, sub, warn, danger,
}: {
  label: string; value: string; sub: string; warn?: boolean; danger?: boolean;
}) {
  return (
    <div className="card-surface p-3 flex flex-col gap-1">
      <p className="label-section">{label}</p>
      <p className={cn(
        "text-[18px] font-semibold font-mono tabular-nums",
        danger ? "text-invalid" : warn ? "text-warning" : "text-primary"
      )}>
        {value}
      </p>
      <p className="text-[10px] text-muted">{sub}</p>
    </div>
  );
}
