import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { getReviewSummaries } from "@/features/reviews";
import { deleteReview } from "@/server/actions/reviews";
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

function CompletedReviewRow({ review }: { review: ReviewSummary }) {
  const date = review.tradeDate.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <Link
      href={`/reviews/${review.id}/results`}
      className="flex items-center gap-4 px-4 py-3 rounded border border-border bg-[var(--bg-surface)] hover:border-border-strong hover:bg-[var(--bg-elevated)] transition-colors"
    >
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
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-primary truncate">{review.instrument}</p>
        {review.setupName && (
          <p className="text-[11px] text-muted font-mono truncate mt-0.5">{review.setupName}</p>
        )}
      </div>
      <p className="text-[11px] text-muted font-mono shrink-0">{date}</p>
      <p className={cn("text-[13px] font-semibold font-mono tabular-nums w-10 text-right shrink-0", scoreColor(review.adherenceScore))}>
        {review.adherenceScore}%
      </p>
    </Link>
  );
}

function DraftReviewRow({
  review,
  discardAction,
}: {
  review: ReviewSummary;
  discardAction: (reviewId: string) => Promise<void>;
}) {
  const date = review.createdAt.toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded border border-accent/20 bg-accent/[0.03]">
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
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-primary truncate">{review.instrument}</p>
        <p className="text-[11px] text-muted font-mono mt-0.5">Started {date}</p>
      </div>
      <Link
        href={`/reviews/${review.id}`}
        className="text-[12px] text-accent font-semibold font-mono shrink-0 hover:text-primary transition-colors"
      >
        Resume →
      </Link>
      <form
        action={async () => {
          "use server";
          await discardAction(review.id);
        }}
      >
        <button
          type="submit"
          className="text-[11px] text-muted hover:text-invalid transition-colors font-mono shrink-0"
        >
          Discard
        </button>
      </form>
    </div>
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

  const draftReviews     = reviews.filter((r) => r.status === "DRAFT");
  const completedReviews = reviews.filter((r) => r.status === "COMPLETE");

  const avgScore =
    completedReviews.length > 0
      ? Math.round(
          completedReviews.reduce((sum, r) => sum + (r.adherenceScore ?? 0), 0) /
          completedReviews.length
        )
      : null;

  async function discardDraft(reviewId: string): Promise<void> {
    "use server";
    await deleteReview(reviewId);
    // deleteReview redirects to /reviews on success.
  }

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

            {/* In-progress drafts — shown first when present */}
            {draftReviews.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] text-muted font-mono uppercase tracking-wider">In progress</p>
                <div className="flex flex-col gap-1.5">
                  {draftReviews.map((r) => (
                    <DraftReviewRow
                      key={r.id}
                      review={r}
                      discardAction={discardDraft}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed reviews */}
            {completedReviews.length === 0 ? (
              <EmptyState
                title="No completed reviews yet."
                description="After each trade, log a review to measure how closely you followed your rules."
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                {completedReviews.map((r) => (
                  <CompletedReviewRow key={r.id} review={r} />
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
