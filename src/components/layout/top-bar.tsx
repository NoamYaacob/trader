import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function TopBar({ title, subtitle, actions, className }: TopBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between h-13 px-8 border-b border-border shrink-0",
        className
      )}
    >
      <div className="flex items-baseline gap-3">
        <h1 className="text-[22px] font-semibold tracking-tightest text-primary leading-none">
          {title}
        </h1>
        {subtitle && (
          <span className="text-[11px] text-muted font-mono">{subtitle}</span>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
