import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TrainingSessionSummary } from "@/features/training/types";

interface Props {
  sessions: TrainingSessionSummary[];
}

function scoreColor(score: number | null): string {
  if (score === null) return "text-muted";
  if (score >= 80) return "text-valid";
  if (score >= 60) return "text-warning";
  return "text-invalid";
}

export function TrainingHistory({ sessions }: Props) {
  if (sessions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] text-muted font-mono uppercase tracking-wider">Past sessions</p>
      <div className="flex flex-col gap-1.5">
        {sessions.map((s) => {
          const isComplete = s.status === "COMPLETED";
          const href       = isComplete ? `/training/${s.id}/results` : `/training/${s.id}`;
          const date       = s.createdAt.toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          });

          return (
            <Link
              key={s.id}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded border border-border bg-[var(--bg-surface)] hover:border-border-strong hover:bg-[var(--bg-elevated)] transition-colors"
            >
              {/* Score or in-progress indicator */}
              <span
                className={cn(
                  "text-[13px] font-semibold font-mono tabular-nums w-10 shrink-0",
                  isComplete ? scoreColor(s.score) : "text-muted"
                )}
              >
                {isComplete ? (s.score !== null ? `${s.score}%` : "—") : "···"}
              </span>

              {/* Correct / total */}
              <span className="text-[11px] text-muted font-mono tabular-nums shrink-0">
                {isComplete ? `${s.correctCount}/${s.totalCount}` : `${s.correctCount}/${s.totalCount} so far`}
              </span>

              {/* Spacer */}
              <span className="flex-1" />

              {/* Playbook version */}
              {s.playbookVersion !== null && (
                <span className="text-[10px] text-muted font-mono shrink-0">
                  v{s.playbookVersion}
                </span>
              )}

              {/* Date */}
              <span className="text-[11px] text-muted font-mono shrink-0">{date}</span>

              {/* Resume label for in-progress */}
              {!isComplete && (
                <span className="text-[11px] text-accent font-mono shrink-0">Resume →</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
