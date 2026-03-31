import Link from "next/link";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/features/playbook/types";
import type { RuleCategory } from "@/features/playbook/types";
import type { ReviewResults, TradeDirection } from "@/features/reviews/types";

interface Props {
  results:         ReviewResults;
  newReviewAction: () => Promise<void>;
}

function DirectionBadge({ direction }: { direction: TradeDirection }) {
  return (
    <span
      className={cn(
        "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border",
        direction === "LONG"
          ? "border-valid/30 text-valid bg-valid/[0.06]"
          : "border-invalid/30 text-invalid bg-invalid/[0.06]"
      )}
    >
      {direction}
    </span>
  );
}

export function ReviewSummaryView({ results, newReviewAction }: Props) {
  const { review, adherenceScore, followedCount, brokeCount, naCount, byCategory } = results;

  const scoreColor =
    adherenceScore >= 80 ? "text-valid"
    : adherenceScore >= 60 ? "text-warning"
    : "text-invalid";

  const formattedDate = review.tradeDate.toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });

  return (
    <div className="flex flex-col gap-8 max-w-[640px] w-full mx-auto py-10 px-4">

      {/* Score header */}
      <div className="text-center flex flex-col items-center gap-1.5">
        <p className={cn("font-semibold leading-none tabular-nums", scoreColor)} style={{ fontSize: 64 }}>
          {adherenceScore}%
        </p>
        <p className="text-[14px] text-secondary">
          {followedCount} followed · {brokeCount} broke · {naCount} N/A
        </p>
        <p className="text-[12px] text-muted font-mono mt-1">
          {review.instrument} · <DirectionBadge direction={review.direction} /> · {formattedDate}
        </p>
      </div>

      {/* Trade notes */}
      {review.notes && (
        <div className="border-l-2 border-border px-4 py-3">
          <p className="text-[11px] text-muted font-mono uppercase tracking-wider mb-1.5">Notes</p>
          <p className="text-[13px] text-secondary leading-relaxed">{review.notes}</p>
        </div>
      )}

      {/* Rule adherence by category */}
      <div className="flex flex-col gap-6">
        {byCategory.map(({ category, rules, followed, broke }) => {
          const catTotal = followed + broke;
          const catPct   = catTotal > 0 ? Math.round((followed / catTotal) * 100) : null;

          return (
            <div key={category}>
              {/* Category header */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-muted font-mono uppercase tracking-wider">
                  {CATEGORY_LABELS[category as RuleCategory]}
                </p>
                {catPct !== null && (
                  <span
                    className={cn(
                      "text-[11px] font-mono tabular-nums",
                      catPct >= 80 ? "text-valid" : catPct >= 60 ? "text-warning" : "text-invalid"
                    )}
                  >
                    {catPct}%
                  </span>
                )}
              </div>

              {/* Rules */}
              <div className="flex flex-col gap-1.5">
                {rules.map((row) => (
                  <div
                    key={row.id}
                    className={cn(
                      "flex items-start gap-3 px-3 py-2.5 rounded border",
                      row.status === "FOLLOWED" ? "border-valid/20 bg-valid/[0.03]"
                      : row.status === "BROKE"   ? "border-invalid/25 bg-invalid/[0.04]"
                      : "border-border"
                    )}
                  >
                    <span
                      className={cn(
                        "text-[11px] font-mono font-semibold shrink-0 mt-px w-5 text-right",
                        row.status === "FOLLOWED" ? "text-valid"
                        : row.status === "BROKE"   ? "text-invalid"
                        : "text-muted"
                      )}
                    >
                      {row.status === "FOLLOWED" ? "✓" : row.status === "BROKE" ? "✗" : "—"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-[12px] leading-snug",
                          row.status === "NA" ? "text-muted" : "text-primary"
                        )}
                      >
                        {row.ruleText}
                      </p>
                      {row.notes && (
                        <p className="text-[11px] text-muted font-mono mt-1 leading-snug">{row.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <form action={newReviewAction}>
          <button
            type="submit"
            className="w-full py-3.5 rounded bg-accent text-[var(--bg-base)] font-semibold text-[14px] tracking-tight hover:opacity-90 transition-opacity"
          >
            New review
          </button>
        </form>
        <Link
          href="/reviews"
          className="text-center text-[12px] text-muted hover:text-secondary transition-colors font-mono"
        >
          ← All reviews
        </Link>
      </div>

    </div>
  );
}
