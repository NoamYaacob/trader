import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SessionResults } from "@/features/training/types";

interface Props {
  results:           SessionResults;
  trainAgainAction?: () => Promise<void>;
}

export function SessionResultsView({ results, trainAgainAction }: Props) {
  const { session, attempts, validAccuracy, invalidAccuracy, bySetup } = results;

  const score = session.score ?? 0;
  const scoreColor =
    score >= 80 ? "text-valid"
    : score >= 60 ? "text-warning"
    : "text-invalid";

  return (
    <div className="flex flex-col gap-8 max-w-[640px] w-full mx-auto py-10 px-4">

      {/* Score — number leads, no ceremony label */}
      <div className="text-center flex flex-col items-center gap-1.5">
        <p className={cn("font-semibold leading-none tabular-nums", scoreColor)} style={{ fontSize: 64 }}>
          {score}%
        </p>
        <p className="text-[14px] text-secondary">
          {session.correctCount} of {session.totalCount} correct
        </p>
      </div>

      {/* Accuracy breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-surface px-5 py-4">
          <p className="text-[11px] text-muted font-mono mb-2">Valid reads</p>
          <p className={cn("text-[28px] font-semibold leading-none tabular-nums", validAccuracy >= 0 ? "text-valid" : "text-muted")}>
            {validAccuracy >= 0 ? `${validAccuracy}%` : "—"}
          </p>
          <p className="text-[11px] text-muted font-mono mt-1">
            {validAccuracy >= 0 ? "of valid examples" : "no valid examples"}
          </p>
        </div>
        <div className="card-surface px-5 py-4">
          <p className="text-[11px] text-muted font-mono mb-2">Invalid reads</p>
          <p className={cn("text-[28px] font-semibold leading-none tabular-nums", invalidAccuracy >= 0 ? "text-invalid" : "text-muted")}>
            {invalidAccuracy >= 0 ? `${invalidAccuracy}%` : "—"}
          </p>
          <p className="text-[11px] text-muted font-mono mt-1">
            {invalidAccuracy >= 0 ? "of invalid examples" : "no invalid examples"}
          </p>
        </div>
      </div>

      {/* Per-setup breakdown */}
      {bySetup.length > 1 && (
        <div className="flex flex-col gap-2">
          {bySetup.map(({ setupName, correct, total }) => {
            const pct      = Math.round((correct / total) * 100);
            const barColor = pct >= 80 ? "bg-valid" : pct >= 60 ? "bg-warning" : "bg-invalid";
            return (
              <div key={setupName} className="flex items-center gap-3">
                <p className="text-[12px] text-secondary font-mono w-40 truncate shrink-0">{setupName}</p>
                <div className="flex-1 h-1.5 bg-[var(--bg-inset)] rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", barColor)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted font-mono w-16 text-right shrink-0 tabular-nums">
                  {correct}/{total} · {pct}%
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Attempt list — list format, not thumbnail grid */}
      <div className="flex flex-col gap-1.5">
        {attempts.map((attempt, i) => (
          <div
            key={attempt.exampleId}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded border",
              attempt.isCorrect ? "border-border" : "border-invalid/25 bg-invalid/[0.03]"
            )}
          >
            {/* Thumbnail */}
            <div className="w-12 h-9 rounded overflow-hidden shrink-0 bg-[var(--bg-inset)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attempt.imageUrl}
                alt={attempt.setupName}
                className="w-full h-full object-cover block"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-primary font-mono truncate">{attempt.setupName}</p>
              <p className="text-[10px] text-muted font-mono mt-0.5">
                <span className={attempt.actualClassification === "VALID" ? "text-valid" : "text-invalid"}>
                  {attempt.actualClassification}
                </span>
                {!attempt.isCorrect && (
                  <span className="text-muted/70"> · you said {attempt.userAnswer.toLowerCase()}</span>
                )}
              </p>
            </div>

            {/* Index + grade */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-muted font-mono tabular-nums">{i + 1}</span>
              <span
                className={cn(
                  "text-[11px] font-mono font-semibold w-6 text-right",
                  attempt.isCorrect ? "text-valid" : "text-invalid"
                )}
              >
                {attempt.isCorrect ? "✓" : "✗"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        {trainAgainAction && (
          <form action={trainAgainAction}>
            <button
              type="submit"
              className="w-full py-3.5 rounded bg-accent text-[var(--bg-base)] font-semibold text-[14px] tracking-tight hover:opacity-90 transition-opacity"
            >
              Train again
            </button>
          </form>
        )}
        <Link
          href="/setups"
          className="text-center text-[12px] text-muted hover:text-secondary transition-colors font-mono"
        >
          ← Setup library
        </Link>
      </div>

    </div>
  );
}
