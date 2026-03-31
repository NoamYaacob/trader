"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./step-indicator";
import { StepInstrument }   from "./steps/step-instrument";
import { StepOverview }     from "./steps/step-overview";
import { StepEntry }        from "./steps/step-entry";
import { StepExit }         from "./steps/step-exit";
import { StepInvalidation } from "./steps/step-invalidation";
import { StepRisk }         from "./steps/step-risk";
import { StepSetups }       from "./steps/step-setups";
import { saveIntakeStep, submitIntake } from "@/server/actions/strategy";
import { INTAKE_STEPS, TOTAL_STEPS } from "@/features/strategy/types";
import type { StrategyRecord, IntakeStepNumber } from "@/features/strategy/types";

interface IntakeFormProps {
  strategy: StrategyRecord;
}

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  center:              { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir * -24 }),
};

export function IntakeForm({ strategy }: IntakeFormProps) {
  const [step, setStep] = useState<IntakeStepNumber>(
    Math.min(strategy.intakeStep, TOTAL_STEPS) as IntakeStepNumber
  );
  const [fields, setFields]     = useState({ ...strategy.intake });
  const [error, setError]       = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const direction = useRef<1 | -1>(1);

  const currentMeta = INTAKE_STEPS[step];

  function setField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function handleBack() {
    if (step > 1 && !isPending && !justSaved) {
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
        const result = await saveIntakeStep(strategy.id, step, stepData);
        if (!result.success) { setError(result.error); return; }
        setJustSaved(true);
        await new Promise<void>((r) => setTimeout(r, 600));
        setJustSaved(false);
        direction.current = 1;
        setStep((s) => (s + 1) as IntakeStepNumber);
      } else {
        const result = await submitIntake(strategy.id, stepData);
        // submitIntake redirects on success — only reaches here on error.
        if (result && !result.success) setError(result.error);
      }
    });
  }

  // Cmd+Enter / Ctrl+Enter keyboard shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isPending && !justSaved) handleContinue();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, fields, isPending, justSaved]);

  return (
    <div className="flex flex-col gap-8 max-w-[580px] w-full mx-auto py-12 px-4">

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Step content */}
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

        {/* Error message */}
        {error && (
          <div className="mt-4 px-3 py-2.5 border-l-2 border-invalid bg-invalid/5 rounded-r">
            <p className="text-[12px] text-invalid leading-snug">{error}</p>
          </div>
        )}
      </div>

      {/* Final step note */}
      {step === TOTAL_STEPS && (
        <p className="text-[12px] text-muted leading-relaxed -mt-4">
          Last step. Submitting will send your strategy for AI processing — your playbook will be ready shortly.
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={step === 1 || isPending || justSaved}
        >
          ← Back
        </Button>

        <div className="flex items-center gap-3">
          {justSaved && (
            <span className="text-[12px] text-accent font-mono tracking-wide">Saved ✓</span>
          )}
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={isPending || justSaved}
          >
            {isPending && !justSaved
              ? "Saving…"
              : step === TOTAL_STEPS
              ? "Complete intake"
              : "Continue →"}
          </Button>
        </div>
      </div>

    </div>
  );
}
