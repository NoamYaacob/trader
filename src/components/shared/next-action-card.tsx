import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NextActionCardProps {
  title: string;
  description: string;
  cta: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function NextActionCard({
  title,
  description,
  cta,
  href,
  onClick,
  className,
}: NextActionCardProps) {
  return (
    <div
      className={cn(
        "card-surface accent-border-left",
        "bg-[linear-gradient(to_right,var(--accent-dim),transparent)]",
        "flex items-center justify-between gap-6 p-5",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold text-primary tracking-tight">{title}</p>
        <p className="text-[13px] text-secondary leading-relaxed">{description}</p>
      </div>
      {href ? (
        <a href={href} className="shrink-0">
          <Button variant="primary" size="default">
            {cta}
          </Button>
        </a>
      ) : (
        <Button variant="primary" size="default" onClick={onClick} className="shrink-0">
          {cta}
        </Button>
      )}
    </div>
  );
}
