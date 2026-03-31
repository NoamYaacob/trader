import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PlaybookVersionSummary } from "@/features/playbook/data/playbook";

interface Props {
  versions: PlaybookVersionSummary[];
}

function StatusBadge({ status }: { status: PlaybookVersionSummary["status"] }) {
  return (
    <span
      className={cn(
        "text-[10px] font-mono px-1.5 py-0.5 rounded border",
        status === "CONFIRMED" ? "border-accent/30 text-accent bg-accent/[0.06]"
        : status === "DRAFT"   ? "border-border text-secondary"
        : "border-border text-muted"
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}

export function PlaybookHistory({ versions }: Props) {
  if (versions.length === 0) {
    return (
      <p className="text-[13px] text-muted font-mono">No versions found.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {versions.map((v) => {
        const date = v.createdAt.toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        });

        // Current / DRAFT versions link to the main playbook page.
        // Archived versions link to the archive read-only view.
        const href =
          v.status === "ARCHIVED"
            ? `/playbook/archive/${v.id}`
            : "/playbook";

        return (
          <Link
            key={v.id}
            href={href}
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded border transition-colors",
              v.status === "ARCHIVED"
                ? "border-border hover:border-border-strong hover:bg-[var(--bg-elevated)]"
                : "border-accent/25 bg-accent/[0.03] hover:bg-accent/[0.06]"
            )}
          >
            {/* Version number */}
            <span className="text-[13px] font-mono text-primary font-semibold w-6 shrink-0">
              v{v.version}
            </span>

            {/* Status */}
            <StatusBadge status={v.status} />

            {/* Rule count */}
            <p className="text-[12px] text-secondary font-mono flex-1">
              {v.ruleCount} rule{v.ruleCount !== 1 ? "s" : ""}
            </p>

            {/* Date */}
            <p className="text-[11px] text-muted font-mono shrink-0">{date}</p>

            {/* Arrow for archived */}
            {v.status === "ARCHIVED" && (
              <span className="text-[11px] text-muted font-mono shrink-0">→</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
