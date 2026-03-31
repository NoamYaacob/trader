import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-start gap-3 py-8", className)}>
      <div className="w-6 h-px bg-border-strong" />
      <p className="text-[14px] font-medium text-primary">{title}</p>
      {description && (
        <p className="text-[12px] text-muted leading-relaxed max-w-[340px]">{description}</p>
      )}
      {action && (
        action.href ? (
          <a href={action.href} className="mt-1">
            <Button variant="secondary" size="sm">{action.label}</Button>
          </a>
        ) : (
          <Button variant="secondary" size="sm" className="mt-1" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
