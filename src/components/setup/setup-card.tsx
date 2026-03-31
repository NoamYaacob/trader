import Link from "next/link";
import type { SetupSummary } from "@/features/setup/types";

interface SetupCardProps {
  setup: SetupSummary;
}

export function SetupCard({ setup }: SetupCardProps) {
  const totalExamples = setup.validCount + setup.invalidCount;

  return (
    <Link
      href={`/setups/${setup.id}`}
      className="card-surface p-5 flex flex-col gap-3 hover:border-border-strong transition-colors group"
    >
      {/* Name */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[14px] font-semibold text-primary leading-snug group-hover:text-accent transition-colors">
          {setup.name}
        </p>
        <span className="text-[11px] text-muted font-mono shrink-0 mt-0.5">
          {totalExamples === 0
            ? "no examples"
            : `${setup.validCount}v / ${setup.invalidCount}i`}
        </span>
      </div>

      {/* Description */}
      {setup.description && (
        <p className="text-[12px] text-secondary leading-relaxed line-clamp-2">
          {setup.description}
        </p>
      )}

      {/* Tags */}
      {setup.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {setup.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono text-accent/80 border border-accent/20 bg-accent/5 rounded px-1.5 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
