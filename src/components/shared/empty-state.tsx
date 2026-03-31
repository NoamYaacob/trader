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
    <div
      className={cn(
        "flex flex-col items-start gap-3 py-10 px-1",
        className
      )}
    >
      <p className="text-[15px] font-medium text-secondary">{title}</p>
      {description && (
        <p className="text-[13px] text-muted leading-relaxed max-w-sm">{description}</p>
      )}
      {action && (
        action.href ? (
          <a href={action.href}>
            <Button variant="secondary" size="sm" className="mt-1">
              {action.label}
            </Button>
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
