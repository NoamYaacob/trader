"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { aiAdapter } from "@/features/ai";
import {
  createPlaybookWithRules,
  getLatestPlaybook,
  confirmPlaybook as dbConfirmPlaybook,
  archivePlaybook as dbArchivePlaybook,
  updateRule as dbUpdateRule,
  removeRule as dbRemoveRule,
  setRuleChecklist as dbSetRuleChecklist,
  addRule as dbAddRule,
} from "@/features/playbook/data/playbook";
import {
  setStrategyProcessing,
  setStrategyActive,
  setStrategyFailed,
} from "@/features/strategy/data/strategy";
import { prisma } from "@/db/client";
import type { RuleCategory } from "@/features/playbook/types";
import type { PlaybookRecord } from "@/features/playbook/types";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session.user.id;
}

// Triggered from submitIntake and regeneration flows. Calls the AI adapter,
// persists the playbook, and advances the strategy status to ACTIVE.
// On any error: sets strategy to FAILED so the playbook page can surface a
// clear failure state with a retry CTA — never leaves the strategy stuck at PROCESSING.
export async function generatePlaybook(
  strategyId: string,
  userId: string,
  revisionNotes?: string
): Promise<void> {
  // Load the full strategy data for the AI adapter.
  const strategy = await prisma.strategy.findFirst({
    where: { id: strategyId, userId },
  });
  if (!strategy) return;

  await setStrategyProcessing(strategyId, userId);

  try {
    const draft = await aiAdapter.generatePlaybook({
      instrument:             strategy.instrument             ?? "",
      timeframe:              strategy.timeframe              ?? "",
      overview:               strategy.overview               ?? "",
      entryConditions:        strategy.entryConditions        ?? "",
      exitConditions:         strategy.exitConditions         ?? "",
      invalidationConditions: strategy.invalidationConditions ?? "",
      riskRules:              strategy.riskRules              ?? "",
      whatMakesValid:         strategy.whatMakesValid         ?? "",
      whatMakesInvalid:       strategy.whatMakesInvalid       ?? "",
      revisionNotes:          revisionNotes?.trim() || undefined,
    });

    await createPlaybookWithRules(strategyId, userId, draft.summary, draft.rules);
    await setStrategyActive(strategyId, userId);
  } catch (err) {
    // Mark the strategy as FAILED so the playbook page renders a clear error
    // state with a retry CTA. Never leave the strategy stuck at PROCESSING.
    console.error("[generatePlaybook] AI generation failed:", err);
    await setStrategyFailed(strategyId, userId);
  }
}

// Retries playbook generation for a FAILED strategy.
// Re-triggers the AI pipeline without re-archiving any existing playbook
// (the archive step in regeneratePlaybook already ran before the failure).
export async function retryGeneratePlaybook(
  strategyId: string
): Promise<never> {
  const userId = await requireUserId();

  const strategy = await prisma.strategy.findFirst({
    where:  { id: strategyId, userId, status: "FAILED" },
    select: { id: true },
  });
  if (!strategy) redirect("/playbook");

  await generatePlaybook(strategyId, userId);
  redirect("/playbook");
}

// Called from the /playbook page to load the current user's latest playbook.
export async function getMyPlaybook(): Promise<PlaybookRecord | null> {
  const userId = await requireUserId();
  const strategy = await prisma.strategy.findFirst({
    where:   { userId, status: { in: ["ACTIVE", "PROCESSING", "SUBMITTED"] } },
    orderBy: { createdAt: "desc" },
    select:  { id: true },
  });
  if (!strategy) return null;
  return getLatestPlaybook(strategy.id, userId);
}

// Confirms the playbook (status DRAFT → CONFIRMED) and redirects to dashboard.
export async function confirmPlaybook(
  playbookId: string
): Promise<{ success: false; error: string } | never> {
  const userId = await requireUserId();
  const result = await dbConfirmPlaybook(playbookId, userId);
  if (!result.success) return result;
  redirect("/dashboard");
}

// Archives the current CONFIRMED playbook, then generates a new version from
// the same strategy intake. The new version starts as DRAFT for the user to review.
// Old training sessions and trade reviews reference their original playbookId and
// are unaffected — archived playbooks are never deleted.
// Optional revisionNotes are passed to the AI adapter as extra context.
export async function regeneratePlaybook(
  playbookId: string,
  revisionNotes?: string
): Promise<{ success: false; error: string } | never> {
  const userId = await requireUserId();

  // Verify ownership and load the playbook's strategyId.
  const playbook = await prisma.playbook.findFirst({
    where:  { id: playbookId, status: "CONFIRMED", strategy: { userId } },
    select: { id: true, strategyId: true },
  });
  if (!playbook) {
    return { success: false, error: "Playbook not found or not confirmed." };
  }

  // Archive the current version first.
  const archiveResult = await dbArchivePlaybook(playbookId, userId);
  if (!archiveResult.success) return archiveResult;

  // Generate new version using the existing AI adapter path.
  await generatePlaybook(playbook.strategyId, userId, revisionNotes);

  redirect("/playbook");
}

// Updates the text of a rule inline.
export async function updateRule(
  ruleId: string,
  playbookId: string,
  text: string
): Promise<{ success: true } | { success: false; error: string }> {
  const userId = await requireUserId();
  if (!text.trim()) return { success: false, error: "Rule text cannot be empty." };
  return dbUpdateRule(ruleId, playbookId, userId, text);
}

// Removes a rule from the playbook.
export async function removeRule(
  ruleId: string,
  playbookId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const userId = await requireUserId();
  return dbRemoveRule(ruleId, playbookId, userId);
}

// Toggles whether a rule appears in the pre-trade checklist.
export async function setRuleChecklist(
  ruleId: string,
  playbookId: string,
  inChecklist: boolean
): Promise<{ success: true } | { success: false; error: string }> {
  const userId = await requireUserId();
  return dbSetRuleChecklist(ruleId, playbookId, userId, inChecklist);
}

// Adds a trader-written rule.
export async function addRule(
  playbookId: string,
  category: RuleCategory,
  text: string
): Promise<{ success: true; ruleId: string } | { success: false; error: string }> {
  const userId = await requireUserId();
  if (!text.trim()) return { success: false, error: "Rule text cannot be empty." };
  const result = await dbAddRule(playbookId, userId, category, text);
  if (!result.success) return result;
  return { success: true, ruleId: result.rule.id };
}
