"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base — shared across all variants
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold tracking-normal transition-colors duration-150",
    "rounded disabled:pointer-events-none disabled:opacity-40",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-base)]",
    "text-[13px] leading-none",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-accent text-[#0d0d0f] border-0",
          "hover:bg-accent-hover active:bg-[var(--accent-active)]",
        ],
        secondary: [
          "bg-transparent border border-border-strong text-primary",
          "hover:bg-elevated hover:border-border-focus",
        ],
        ghost: [
          "bg-transparent border-0 text-secondary",
          "hover:bg-elevated hover:text-primary",
        ],
        destructive: [
          "bg-transparent border border-[rgba(217,95,95,0.30)] text-invalid",
          "hover:bg-[rgba(217,95,95,0.08)]",
        ],
      },
      size: {
        sm:      "h-7 px-3 text-[12px]",
        default: "h-[34px] px-4",
        lg:      "h-10 px-5 text-[14px]",
        icon:    "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
