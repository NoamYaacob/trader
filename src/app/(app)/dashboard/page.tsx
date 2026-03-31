import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { StatCard } from "@/components/shared/stat-card";
import { NextActionCard } from "@/components/shared/next-action-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getLatestStrategy } from "@/features/strategy";
import { getLatestPlaybook } from "@/features/playbook/data/playbook";
import { getSetupCount } from "@/features/setup";
import { getTrainableSetups } from "@/features/training";
import { getReviewSummaries } from "@/features/reviews";
import { INTAKE_STEPS } from "@/features/strategy/types";
import type { IntakeStepNumber } from "@/features/strategy/types";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId   = session.user.id;
  const strategy = await getLatestStrategy(userId);

  // Load playbook and setup count only when relevant.
  const playbook =
    strategy?.status === "ACTIVE"
      ? await getLatestPlaybook(strategy.id, userId)
      : null;

  const setupCount =
    strategy?.status === "ACTIVE" ? await getSetupCount(userId) : 0;

  const trainableSetups =
    strategy?.status === "ACTIVE" && playbook?.status === "CONFIRMED"
      ? await getTrainableSetups(userId)
      : [];

  const recentReviews =
    strategy?.status === "ACTIVE" && playbook?.status === "CONFIRMED"
      ? await getReviewSummaries(userId, 5)
      : [];

  // ── Derive display state ──────────────────────────────────────────────

  let subtitle = "No playbook confirmed";
  let nextActionCard: React.ReactNode;

  if (!strategy || strategy.status === "DRAFT") {
    const stepNum = (strategy?.intakeStep ?? 1) as IntakeStepNumber;
    const isNew   = !strategy || strategy.intakeStep <= 1;

    subtitle        = "No playbook yet";
    nextActionCard  = isNew ? (
      <NextActionCard
        title="Start with your strategy intake."
        description="Describe your strategy in plain language. We'll formalize it into a playbook you can train against."
        cta="Begin intake"
        href="/onboarding"
      />
    ) : (
      <NextActionCard
        title={`Continue your intake — step ${stepNum} of 7.`}
        description={`You stopped at: "${INTAKE_STEPS[stepNum]?.title ?? ""}". Pick up where you left off.`}
        cta="Continue intake"
        href="/onboarding"
      />
    );
  } else if (
    strategy.status === "SUBMITTED" ||
    strategy.status === "PROCESSING"
  ) {
    subtitle = "Generating playbook…";
    nextActionCard = (
      <div className="card-surface accent-border-left bg-[linear-gradient(100deg,var(--accent-dim),var(--accent-dim-2)_40%,transparent_70%)] flex items-center gap-6 px-6 py-5">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
        <div>
          <p className="text-[15px] font-semibold text-primary tracking-tight">
            Building your playbook
          </p>
          <p className="text-[13px] text-secondary leading-snug mt-1">
            Your intake has been submitted. Rules are being generated from your strategy description.
          </p>
        </div>
        <a href="/playbook" className="shrink-0 ml-auto text-[12px] text-accent hover:text-primary transition-colors font-mono">
          View status →
        </a>
      </div>
    );
  } else if (strategy.status === "ACTIVE" && playbook?.status === "DRAFT") {
    subtitle = `v${playbook.version} · awaiting review`;
    nextActionCard = (
      <NextActionCard
        title="Your playbook is ready for review."
        description={`${playbook.rules.length} rules generated from your strategy intake. Review, edit, and confirm each rule before training.`}
        cta="Review playbook"
        href="/playbook"
      />
    );
  } else if (strategy.status === "ACTIVE" && playbook?.status === "CONFIRMED") {
    const checklistN    = playbook.rules.filter((r) => r.inChecklist).length;
    const readyToTrain  = trainableSetups.length > 0;
    const totalExamples = trainableSetups.reduce((sum, s) => sum + s.exampleCount, 0);
    subtitle = `v${playbook.version} · ${playbook.rules.length} rules confirmed`;

    nextActionCard = readyToTrain ? (
      <NextActionCard
        title="Your playbook is confirmed. Start training."
        description={`${trainableSetups.length} setup${trainableSetups.length !== 1 ? "s" : ""} ready · ${totalExamples} example${totalExamples !== 1 ? "s" : ""}. Run a recognition drill to sharpen your eye.`}
        cta="Start training →"
        href="/training"
      />
    ) : (
      <div className="card-surface accent-border-left bg-[linear-gradient(100deg,var(--accent-dim),var(--accent-dim-2)_40%,transparent_70%)] flex items-center gap-6 px-6 py-5">
        <div>
          <p className="text-[15px] font-semibold text-primary tracking-tight">
            Playbook confirmed.
          </p>
          <p className="text-[13px] text-secondary leading-snug mt-1">
            {playbook.rules.length} rules active · {checklistN} in pre-trade checklist.
            {" "}Add annotated examples to your setups to unlock training sessions.
          </p>
        </div>
        <a href="/setups" className="shrink-0 ml-auto text-[12px] text-accent hover:text-primary transition-colors font-mono">
          Go to setups →
        </a>
      </div>
    );
  }

  // Playbook + session stats.
  const ruleCount      = playbook?.rules.length ?? 0;
  const checklistCount = playbook?.rules.filter((r) => r.inChecklist).length ?? 0;

  // Review stats.
  const completedReviews = recentReviews.filter((r) => r.status === "COMPLETE");
  const lastScore        = completedReviews[0]?.adherenceScore ?? null;
  const thisWeek         = completedReviews.filter((r) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return r.completedAt ? r.createdAt >= cutoff : false;
  }).length;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Dashboard" subtitle={subtitle} />

      <div className="flex-1 p-8 space-y-5 max-w-[1060px] w-full mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Rules"         value={ruleCount > 0 ? String(ruleCount) : "—"} detail={ruleCount > 0 ? `${checklistCount} in checklist` : undefined} />
          <StatCard label="Setups"        value={setupCount > 0 ? String(setupCount) : "—"} />
          <StatCard label="Last review"   value={lastScore !== null ? `${lastScore}%` : "—"} detail={lastScore !== null ? "adherence" : "no reviews"} />
          <StatCard label="This week"     value={thisWeek > 0 ? String(thisWeek) : "—"} detail={thisWeek > 0 ? `review${thisWeek !== 1 ? "s" : ""}` : "0 reviews"} />
        </div>

        {/* Next action */}
        {nextActionCard}

        {/* Activity columns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-surface p-5 flex flex-col gap-3">
            <p className="label-section">Recent Sessions</p>
            <EmptyState
              title="No sessions yet."
              description="Add a setup with an annotated example before running your first training session."
            />
          </div>

          <div className="card-surface p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="label-section">Recent Reviews</p>
              <Link href="/reviews" className="text-[11px] text-secondary hover:text-primary transition-colors font-mono">
                View all →
              </Link>
            </div>
            {completedReviews.length === 0 ? (
              <EmptyState
                title="No reviews logged."
                description="After a trade, log it here to measure how closely you followed your rules."
                action={{ label: "Log a review", href: "/reviews/new" }}
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                {completedReviews.slice(0, 4).map((r) => {
                  const date = r.tradeDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const sc   = r.adherenceScore;
                  const col  = sc !== null && sc >= 80 ? "text-valid" : sc !== null && sc >= 60 ? "text-warning" : "text-invalid";
                  return (
                    <Link
                      key={r.id}
                      href={`/reviews/${r.id}/results`}
                      className="flex items-center gap-3 px-3 py-2 rounded border border-border hover:border-border-strong hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <span className={cn(
                        "text-[10px] font-mono font-semibold px-1 py-px rounded border shrink-0",
                        r.direction === "LONG"
                          ? "border-valid/30 text-valid"
                          : "border-invalid/30 text-invalid"
                      )}>
                        {r.direction}
                      </span>
                      <p className="text-[12px] text-primary flex-1 truncate">{r.instrument}</p>
                      <p className="text-[11px] text-muted font-mono shrink-0">{date}</p>
                      <p className={cn("text-[12px] font-semibold font-mono tabular-nums w-8 text-right shrink-0", col)}>
                        {sc}%
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Setup preview */}
        <div className="card-surface p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="label-section">Your Setups</p>
            <a
              href="/setups"
              className="text-[11px] text-secondary hover:text-primary transition-colors font-mono"
            >
              View all →
            </a>
          </div>
          <EmptyState
            title="No setups yet."
            description="Build your setup library to enable training sessions."
            action={{ label: "Add first setup", href: "/setups" }}
          />
        </div>

      </div>
    </div>
  );
}
