import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  className?: string;
}

export function StatCard({ label, value, detail, className }: StatCardProps) {
  return (
    <div className={cn("card-surface px-5 py-4 flex flex-col gap-3", className)}>
      <p className="label-section">{label}</p>
      <div className="flex items-end gap-2">
        <p className="stat-lg text-primary">{value}</p>
        {detail && (
          <span className="text-[11px] text-muted font-mono mb-0.5 leading-none">{detail}</span>
        )}
      </div>
    </div>
  );
}
