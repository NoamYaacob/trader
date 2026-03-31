import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SessionResults } from "@/features/training/types";

interface Props {
  results:           SessionResults;
  trainAgainAction?: () => Promise<void>;
}

export function SessionResultsView({ results, trainAgainAction }: Props) {
  const { session, attempts, validAccuracy, invalidAccuracy, bySetup } = results;

  const scoreColor =
    (session.score ?? 0) >= 80 ? "text-valid"
    : (session.score ?? 0) >= 60 ? "text-warning"
    : "text-invalid";

  return (
    <div className="flex flex-col gap-8 max-w-[680px] w-full mx-auto py-10 px-4">

      {/* Score header */}
      <div className="text-center flex flex-col items-center gap-2">
        <p className="text-[11px] text-muted font-mono uppercase tracking-wider">Session complete</p>
        <p className={cn("font-semibold leading-none", scoreColor)} style={{ fontSize: 64 }}>
          {session.score ?? 0}%
        </p>
        <p className="text-[14px] text-secondary">
          {session.correctCount} of {session.totalCount} correct
        </p>
      </div>

      {/* Accuracy breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-surface px-5 py-4">
          <p className="label-section mb-2">Valid accuracy</p>
          <p className={cn("text-[28px] font-semibold leading-none", validAccuracy >= 0 ? "text-valid" : "text-muted")}>
            {validAccuracy >= 0 ? `${validAccuracy}%` : "—"}
          </p>
          <p className="text-[11px] text-muted font-mono mt-1">
            {validAccuracy >= 0 ? "of valid examples" : "no valid examples"}
          </p>
        </div>
        <div className="card-surface px-5 py-4">
          <p className="label-section mb-2">Invalid accuracy</p>
          <p className={cn("text-[28px] font-semibold leading-none", invalidAccuracy >= 0 ? "text-invalid" : "text-muted")}>
            {invalidAccuracy >= 0 ? `${invalidAccuracy}%` : "—"}
          </p>
          <p className="text-[11px] text-muted font-mono mt-1">
            {invalidAccuracy >= 0 ? "of invalid examples" : "no invalid examples"}
          </p>
        </div>
      </div>

      {/* Per-setup breakdown */}
      {bySetup.length > 1 && (
        <div>
          <p className="label-section mb-3">By setup</p>
          <div className="flex flex-col gap-2">
            {bySetup.map(({ setupName, correct, total }) => {
              const pct     = Math.round((correct / total) * 100);
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
                  <p className="text-[11px] text-muted font-mono w-16 text-right shrink-0">
                    {correct}/{total} · {pct}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Example replay */}
      <div>
        <p className="label-section mb-3">All examples</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {attempts.map((attempt) => (
            <div
              key={attempt.exampleId}
              className={cn(
                "rounded border overflow-hidden relative",
                attempt.isCorrect ? "border-valid/20" : "border-invalid/30"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attempt.imageUrl}
                alt={attempt.setupName}
                className="w-full h-24 object-cover block"
              />
              <div className="px-2 py-1.5 bg-[var(--bg-surface)] flex items-center justify-between gap-1">
                <p className="text-[10px] text-secondary font-mono truncate">{attempt.setupName}</p>
                <span
                  className={cn(
                    "text-[9px] font-mono font-bold uppercase shrink-0",
                    attempt.isCorrect ? "text-valid" : "text-invalid"
                  )}
                >
                  {attempt.isCorrect ? "✓" : "✗"}
                </span>
              </div>
              {/* Actual vs user answer */}
              <div className="px-2 pb-1.5 bg-[var(--bg-surface)]">
                <p className="text-[9px] text-muted font-mono">
                  Actual:{" "}
                  <span className={attempt.actualClassification === "VALID" ? "text-valid" : "text-invalid"}>
                    {attempt.actualClassification}
                  </span>
                  {!attempt.isCorrect && (
                    <span className="text-muted"> · You: {attempt.userAnswer}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Link
          href="/setups"
          className="text-[12px] text-muted hover:text-secondary transition-colors font-mono"
        >
          ← Setup library
        </Link>
        {trainAgainAction && (
          <form action={trainAgainAction}>
            <button
              type="submit"
              className="text-[12px] text-accent hover:text-primary transition-colors font-mono border border-accent/30 hover:border-accent/60 rounded px-3 py-1.5 ml-2"
            >
              Train again →
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
