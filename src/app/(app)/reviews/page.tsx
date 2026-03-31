import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { getReviewSummaries } from "@/features/reviews";
import { getLatestStrategy } from "@/features/strategy";
import { getLatestPlaybook } from "@/features/playbook/data/playbook";
import { cn } from "@/lib/utils";
import type { ReviewSummary } from "@/features/reviews/types";

function scoreColor(score: number | null): string {
  if (score === null) return "text-muted";
  if (score >= 80) return "text-valid";
  if (score >= 60) return "text-warning";
  return "text-invalid";
}

function ReviewRow({ review }: { review: ReviewSummary }) {
  const date = review.tradeDate.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <Link
      href={review.status === "COMPLETE" ? `/reviews/${review.id}/results` : `/reviews/${review.id}`}
      className="flex items-center gap-4 px-4 py-3 rounded border border-border bg-[var(--bg-surface)] hover:border-border-strong hover:bg-[var(--bg-elevated)] transition-colors"
    >
      {/* Direction badge */}
      <span
        className={cn(
          "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border shrink-0",
          review.direction === "LONG"
            ? "border-valid/30 text-valid bg-valid/[0.06]"
            : "border-invalid/30 text-invalid bg-invalid/[0.06]"
        )}
      >
        {review.direction}
      </span>

      {/* Instrument + setup */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-primary truncate">{review.instrument}</p>
        {review.setupName && (
          <p className="text-[11px] text-muted font-mono truncate mt-0.5">{review.setupName}</p>
        )}
      </div>

      {/* Date */}
      <p className="text-[11px] text-muted font-mono shrink-0">{date}</p>

      {/* Score or status */}
      {review.status === "COMPLETE" ? (
        <p className={cn("text-[13px] font-semibold font-mono tabular-nums w-10 text-right shrink-0", scoreColor(review.adherenceScore))}>
          {review.adherenceScore}%
        </p>
      ) : (
        <p className="text-[11px] text-muted font-mono shrink-0">draft</p>
      )}
    </Link>
  );
}

export default async function ReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId   = session.user.id;
  const strategy = await getLatestStrategy(userId);

  const hasActivePlaybook =
    strategy?.status === "ACTIVE" &&
    !!(await getLatestPlaybook(strategy.id, userId).then((pb) => pb?.status === "CONFIRMED" ? pb : null));

  const reviews = strategy?.status === "ACTIVE"
    ? await getReviewSummaries(userId)
    : [];

  const completedReviews = reviews.filter((r) => r.status === "COMPLETE");
  const avgScore =
    completedReviews.length > 0
      ? Math.round(
          completedReviews.reduce((sum, r) => sum + (r.adherenceScore ?? 0), 0) /
          completedReviews.length
        )
      : null;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Trade Review"
        subtitle={completedReviews.length > 0 ? `${completedReviews.length} completed` : undefined}
      />

      <div className="flex-1 p-8 max-w-[680px] w-full mx-auto">
        {!hasActivePlaybook ? (
          <EmptyState
            title="No confirmed playbook yet."
            description="Confirm your playbook before logging trade reviews."
            action={{ label: "Go to playbook", href: "/playbook" }}
          />
        ) : (
          <div className="flex flex-col gap-6">

            {/* Average adherence */}
            {avgScore !== null && (
              <div className="flex items-center gap-3 px-4 py-3 card-surface">
                <p className="text-[12px] text-muted font-mono flex-1">Average adherence</p>
                <p className={cn("text-[20px] font-semibold tabular-nums leading-none", scoreColor(avgScore))}>
                  {avgScore}%
                </p>
              </div>
            )}

            {/* New review CTA */}
            <Link
              href="/reviews/new"
              className="flex items-center justify-between px-4 py-3 rounded border border-accent/30 bg-accent/[0.04] hover:bg-accent/[0.08] hover:border-accent/50 transition-colors"
            >
              <p className="text-[13px] text-accent font-semibold">Log a trade review</p>
              <span className="text-[12px] text-accent/70 font-mono">→</span>
            </Link>

            {/* Review list */}
            {reviews.length === 0 ? (
              <EmptyState
                title="No reviews yet."
                description="After each trade, log a review to measure how closely you followed your rules."
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                {reviews.map((r) => (
                  <ReviewRow key={r.id} review={r} />
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
