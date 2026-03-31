import { z } from "zod";
import type { IntakeStepNumber } from "../types";

// Per-step validation schemas. Each step only validates its own fields.
// All fields are trimmed; none are required to be non-empty (the user
// can fill them partially and return). Minimum meaningful length is
// enforced where the field is the primary content of the step.

// Typed as z.ZodType to avoid coupling to the internal ZodObject generics
// which differ between Zod major versions.
const stepSchemas: Record<IntakeStepNumber, z.ZodType> = {
  1: z.object({
    instrument: z.string().trim().min(1, "Instrument is required."),
    timeframe:  z.string().trim().min(1, "Timeframe is required."),
  }),
  2: z.object({
    overview: z.string().trim().min(20, "Write at least a sentence describing your strategy."),
  }),
  3: z.object({
    entryConditions: z.string().trim().min(10, "Describe at least one entry condition."),
  }),
  4: z.object({
    exitConditions: z.string().trim().min(10, "Describe at least one exit condition."),
  }),
  5: z.object({
    invalidationConditions: z.string().trim().min(10, "Describe at least one invalidation condition."),
  }),
  6: z.object({
    riskRules: z.string().trim().min(10, "Describe at least one risk rule."),
  }),
  7: z.object({
    whatMakesValid:   z.string().trim().min(10, "Describe what makes a setup valid."),
    whatMakesInvalid: z.string().trim().min(10, "Describe what makes a setup invalid."),
  }),
};

export function validateIntakeStep(
  step: IntakeStepNumber,
  data: Record<string, string>
): { success: true; data: Record<string, string> } | { success: false; error: string } {
  const schema = stepSchemas[step];
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues?.[0]?.message ?? "Validation failed.",
    };
  }
  return { success: true, data: result.data as Record<string, string> };
}
