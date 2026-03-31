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
        "bg-[linear-gradient(100deg,var(--accent-dim),var(--accent-dim-2)_40%,transparent_70%)]",
        "flex items-center justify-between gap-8 px-6 py-5",
        className
      )}
    >
      <div className="flex flex-col gap-1.5 min-w-0">
        <p className="text-[15px] font-semibold text-primary tracking-tight">{title}</p>
        <p className="text-[13px] text-secondary leading-snug">{description}</p>
      </div>
      {href ? (
        <a href={href} className="shrink-0">
          <Button variant="primary">{cta}</Button>
        </a>
      ) : (
        <Button variant="primary" onClick={onClick} className="shrink-0">{cta}</Button>
      )}
    </div>
  );
}
