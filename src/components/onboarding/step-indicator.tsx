import { cn } from "@/lib/utils";
import { TOTAL_STEPS, INTAKE_STEPS } from "@/features/strategy/types";
import type { IntakeStepNumber } from "@/features/strategy/types";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const nextStep = currentStep < TOTAL_STEPS ? currentStep + 1 : null;
  const nextTitle = nextStep ? INTAKE_STEPS[nextStep as IntakeStepNumber].title : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const step    = i + 1;
          const done    = step < currentStep;
          const active  = step === currentStep;
          return (
            <div
              key={step}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                done   ? "bg-accent w-5"               : "",
                active ? "bg-accent w-8"               : "",
                !done && !active ? "bg-border-strong w-5" : ""
              )}
            />
          );
        })}
      </div>
      <div className="flex items-baseline justify-between">
        <p className="rule-text text-secondary">
          Step {currentStep} of {TOTAL_STEPS}
        </p>
        {nextTitle && (
          <p className="rule-text text-muted">
            Next: {nextTitle}
          </p>
        )}
      </div>
    </div>
  );
}
