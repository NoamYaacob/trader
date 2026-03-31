import { cn } from "@/lib/utils";
import { TOTAL_STEPS } from "@/features/strategy/types";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const step = i + 1;
          const done    = step < currentStep;
          const active  = step === currentStep;
          return (
            <div
              key={step}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                done   ? "bg-accent w-5"          : "",
                active ? "bg-accent w-8"          : "",
                !done && !active ? "bg-border-strong w-5" : ""
              )}
            />
          );
        })}
      </div>
      <p className="rule-text text-muted">
        Step {currentStep} of {TOTAL_STEPS}
      </p>
    </div>
  );
}
