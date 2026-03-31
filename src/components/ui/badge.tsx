import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default:  "bg-elevated text-secondary border border-border-default text-[10px] tracking-wide uppercase px-1.5 py-0.5",
        accent:   "bg-[var(--accent-dim)] text-accent border border-[rgba(201,168,76,0.25)] text-[10px] tracking-wide uppercase px-1.5 py-0.5",
        valid:    "bg-[rgba(61,168,130,0.12)] text-valid border border-[rgba(61,168,130,0.25)] text-[10px] tracking-wide uppercase px-1.5 py-0.5",
        invalid:  "bg-[rgba(217,95,95,0.12)] text-invalid border border-[rgba(217,95,95,0.25)] text-[10px] tracking-wide uppercase px-1.5 py-0.5",
        warning:  "bg-[rgba(201,122,61,0.12)] text-warning border border-[rgba(201,122,61,0.25)] text-[10px] tracking-wide uppercase px-1.5 py-0.5",
        outline:  "border border-border-default text-secondary text-[10px] tracking-wide uppercase px-1.5 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
