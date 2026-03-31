import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded px-3 py-2.5",
          "bg-inset border border-border",
          "font-mono text-[13px] text-primary leading-relaxed",
          "placeholder:text-muted placeholder:font-sans",
          "resize-y transition-colors duration-150",
          "focus-visible:outline-none focus-visible:border-border-focus",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
