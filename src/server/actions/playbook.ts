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
} from "@/features/strategy/data/strategy";
import { prisma } from "@/db/client";
import type { RuleCategory } from "@/features/playbook/types";
import type { PlaybookRecord } from "@/features/playbook/types";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session.user.id;
}

// Triggered from submitIntake. Calls the AI adapter, persists the playbook,
// and advances the strategy status to ACTIVE.
// Errors are caught and logged — the caller's redirect is never blocked.
export async function generatePlaybook(
  strategyId: string,
  userId: string
): Promise<void> {
  try {
    // Load the full strategy data for the AI adapter.
    const strategy = await prisma.strategy.findFirst({
      where: { id: strategyId, userId },
    });
    if (!strategy) return;

    await setStrategyProcessing(strategyId, userId);

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
    });

    await createPlaybookWithRules(strategyId, userId, draft.summary, draft.rules);
    await setStrategyActive(strategyId, userId);
  } catch (err) {
    // Log the error but do not rethrow — the caller will redirect to /playbook
    // where the user can see the processing state and retry.
    console.error("[generatePlaybook] failed:", err);
  }
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
export async function regeneratePlaybook(
  playbookId: string
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
  // Re-uses the same generatePlaybook logic from initial intake processing.
  await generatePlaybook(playbook.strategyId, userId);

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
