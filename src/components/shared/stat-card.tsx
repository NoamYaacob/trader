import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  className?: string;
}

export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <div className={cn("card-surface p-5 flex flex-col gap-2", className)}>
      <p className="label-section">{label}</p>
      <p className="stat-lg text-primary">{value}</p>
    </div>
  );
}
