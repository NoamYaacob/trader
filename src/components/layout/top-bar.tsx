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
        "flex items-center justify-between h-14 px-8 border-b border-border shrink-0",
        className
      )}
    >
      <div className="flex items-baseline gap-2.5">
        <h1 className="text-[19px] font-semibold tracking-tight text-primary leading-none">
          {title}
        </h1>
        {subtitle && (
          <span className="text-[11px] text-secondary font-mono leading-none">{subtitle}</span>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
