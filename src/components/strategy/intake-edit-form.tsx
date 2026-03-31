"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { StepInstrument }   from "@/components/onboarding/steps/step-instrument";
import { StepOverview }     from "@/components/onboarding/steps/step-overview";
import { StepEntry }        from "@/components/onboarding/steps/step-entry";
import { StepExit }         from "@/components/onboarding/steps/step-exit";
import { StepInvalidation } from "@/components/onboarding/steps/step-invalidation";
import { StepRisk }         from "@/components/onboarding/steps/step-risk";
import { StepSetups }       from "@/components/onboarding/steps/step-setups";
import { saveIntakeStep, finishIntakeEdit } from "@/server/actions/strategy";
import { INTAKE_STEPS, TOTAL_STEPS } from "@/features/strategy/types";
import type { StrategyRecord, IntakeStepNumber } from "@/features/strategy/types";

interface Props {
  strategy: StrategyRecord;
}

const stepVariants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir * 24 }),
  center:              { opacity: 1, x: 0 },
  exit:   (dir: number) => ({ opacity: 0, x: dir * -24 }),
};

export function IntakeEditForm({ strategy }: Props) {
  // Start at step 1 for the edit flow — the user reviews all fields, not resuming.
  const [step, setStep]   = useState<IntakeStepNumber>(1);
  const [fields, setFields] = useState({ ...strategy.intake });
  const [error, setError]   = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const direction = useRef<1 | -1>(1);

  const currentMeta = INTAKE_STEPS[step];

  function setField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function handleBack() {
    if (step > 1 && !isPending) {
      direction.current = -1;
      setStep((s) => (s - 1) as IntakeStepNumber);
    }
  }

  function handleContinue() {
    setError(null);
    const stepData = Object.fromEntries(
      currentMeta.fields.map((f) => [f, (fields as Record<string, string>)[f] ?? ""])
    );

    startTransition(async () => {
      if (step < TOTAL_STEPS) {
        // Save this step's fields to the active strategy.
        const result = await saveIntakeStep(strategy.id, step, stepData);
        if (!result.success) { setError(result.error); return; }
        direction.current = 1;
        setStep((s) => (s + 1) as IntakeStepNumber);
      } else {
        // Final step: save fields and redirect to regeneration confirmation.
        const result = await finishIntakeEdit(strategy.id, stepData);
        if (result && !result.success) setError(result.error);
      }
    });
  }

  // Cmd+Enter / Ctrl+Enter keyboard shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isPending) handleContinue();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, fields, isPending]);

  return (
    <div className="flex flex-col gap-8 max-w-[580px] w-full mx-auto py-12 px-4">

      <StepIndicator currentStep={step} />

      <div>
        <h1
          className="font-semibold text-primary leading-tight mb-1"
          style={{ fontSize: 22, letterSpacing: "-0.025em" }}
        >
          {currentMeta.title}
        </h1>
        <p className="text-[13px] text-secondary mb-6 leading-relaxed">
          {currentMeta.subtitle}
        </p>

        <AnimatePresence mode="wait" custom={direction.current}>
          <motion.div
            key={step}
            custom={direction.current}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeOut" as const }}
          >
            {step === 1 && (
              <StepInstrument
                instrument={fields.instrument ?? ""}
                timeframe={fields.timeframe ?? ""}
                onChange={(field, val) => setField(field, val)}
              />
            )}
            {step === 2 && (
              <StepOverview
                overview={fields.overview ?? ""}
                onChange={(val) => setField("overview", val)}
              />
            )}
            {step === 3 && (
              <StepEntry
                entryConditions={fields.entryConditions ?? ""}
                onChange={(val) => setField("entryConditions", val)}
              />
            )}
            {step === 4 && (
              <StepExit
                exitConditions={fields.exitConditions ?? ""}
                onChange={(val) => setField("exitConditions", val)}
              />
            )}
            {step === 5 && (
              <StepInvalidation
                invalidationConditions={fields.invalidationConditions ?? ""}
                onChange={(val) => setField("invalidationConditions", val)}
              />
            )}
            {step === 6 && (
              <StepRisk
                riskRules={fields.riskRules ?? ""}
                onChange={(val) => setField("riskRules", val)}
              />
            )}
            {step === 7 && (
              <StepSetups
                whatMakesValid={fields.whatMakesValid ?? ""}
                whatMakesInvalid={fields.whatMakesInvalid ?? ""}
                onChangeValid={(val) => setField("whatMakesValid", val)}
                onChangeInvalid={(val) => setField("whatMakesInvalid", val)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-4 px-3 py-2.5 border-l-2 border-invalid bg-invalid/5 rounded-r">
            <p className="text-[12px] text-invalid leading-snug">{error}</p>
          </div>
        )}
      </div>

      {/* Final step note */}
      {step === TOTAL_STEPS && (
        <p className="text-[12px] text-muted leading-relaxed -mt-4">
          Last step. Saving will bring you to the regeneration screen where you can review before generating a new playbook version.
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={step === 1 || isPending}
        >
          ← Back
        </Button>

        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={isPending}
        >
          {isPending
            ? "Saving…"
            : step === TOTAL_STEPS
            ? "Save changes →"
            : "Continue →"}
        </Button>
      </div>

    </div>
  );
}
