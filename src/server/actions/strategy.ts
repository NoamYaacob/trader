"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { validateIntakeStep } from "@/features/strategy/domain/intake";
import {
  getDraftStrategy,
  createDraftStrategy,
  updateStrategyStep,
  submitStrategy,
} from "@/features/strategy/data/strategy";
import { generatePlaybook } from "@/server/actions/playbook";
import type { IntakeStepNumber } from "@/features/strategy/types";

// Ensure the current request is authenticated and return the user id.
async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session.user.id;
}

// Called when the user first reaches /onboarding.
// Returns an existing DRAFT strategy or creates a new one.
export async function getOrCreateDraftStrategy() {
  const userId = await requireUserId();
  const existing = await getDraftStrategy(userId);
  if (existing) return existing;
  return createDraftStrategy(userId);
}

// Called on every "Continue" click.
// Validates, persists the step data, returns success or an error message.
export async function saveIntakeStep(
  strategyId: string,
  step: IntakeStepNumber,
  data: Record<string, string>
): Promise<{ success: true } | { success: false; error: string }> {
  const userId = await requireUserId();

  const validation = validateIntakeStep(step, data);
  if (!validation.success) return { success: false, error: validation.error };

  const nextStep = step < 7 ? step + 1 : 7;
  return updateStrategyStep(strategyId, userId, nextStep, validation.data);
}

// Called from the intake edit flow on the final step.
// Saves step 7 data to the ACTIVE strategy and redirects to the regeneration
// confirmation page. Does NOT mark the strategy as submitted or trigger generation —
// the user chooses whether to regenerate on the next screen.
export async function finishIntakeEdit(
  strategyId: string,
  data: Record<string, string>
): Promise<{ success: false; error: string } | never> {
  const userId = await requireUserId();

  const validation = validateIntakeStep(7, data);
  if (!validation.success) return { success: false, error: validation.error };

  const result = await updateStrategyStep(strategyId, userId, 7, validation.data);
  if (!result.success) return result;

  redirect("/strategy/edit/regenerate");
}

// Called on the final step. Persists the last data, marks strategy SUBMITTED,
// and redirects to /playbook.
export async function submitIntake(
  strategyId: string,
  data: Record<string, string>
): Promise<{ success: false; error: string } | never> {
  const userId = await requireUserId();

  const validation = validateIntakeStep(7, data);
  if (!validation.success) return { success: false, error: validation.error };

  const result = await submitStrategy(strategyId, userId, validation.data);
  if (!result.success) return result;

  // Trigger AI generation. Errors are caught inside — the redirect always runs.
  await generatePlaybook(strategyId, userId);

  redirect("/playbook");
}
