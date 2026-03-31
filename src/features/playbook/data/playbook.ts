import { prisma } from "@/db/client";
import type { PlaybookRecord, PlaybookRule, RuleCategory } from "../types";

// Map a Prisma Rule row to the domain PlaybookRule type.
function toRule(row: {
  id:          string;
  text:        string;
  category:    string;
  source:      string;
  inChecklist: boolean;
  order:       number;
}): PlaybookRule {
  return {
    id:          row.id,
    text:        row.text,
    category:    row.category    as PlaybookRule["category"],
    source:      row.source      as PlaybookRule["source"],
    inChecklist: row.inChecklist,
    order:       row.order,
  };
}

// Map a Prisma Playbook row (with rules) to the domain PlaybookRecord type.
function toPlaybookRecord(row: {
  id:          string;
  strategyId:  string;
  version:     number;
  summary:     string | null;
  status:      string;
  confirmedAt: Date | null;
  createdAt:   Date;
  updatedAt:   Date;
  rules: {
    id:          string;
    text:        string;
    category:    string;
    source:      string;
    inChecklist: boolean;
    order:       number;
  }[];
}): PlaybookRecord {
  return {
    id:          row.id,
    strategyId:  row.strategyId,
    version:     row.version,
    summary:     row.summary,
    status:      row.status as PlaybookRecord["status"],
    confirmedAt: row.confirmedAt,
    rules:       row.rules.map(toRule).sort((a, b) => a.order - b.order),
    createdAt:   row.createdAt,
    updatedAt:   row.updatedAt,
  };
}

// Returns the highest existing version number for a strategy, or 0 if none.
async function getMaxPlaybookVersion(strategyId: string): Promise<number> {
  const result = await prisma.playbook.aggregate({
    where:   { strategyId },
    _max:    { version: true },
  });
  return result._max.version ?? 0;
}

// Creates a new Playbook with its rules in a single transaction.
// Uses a two-step approach (create + fetch) to ensure rules are included
// in the return value with correct TypeScript types.
export async function createPlaybookWithRules(
  strategyId: string,
  userId: string,
  summary: string,
  rules: { text: string; category: RuleCategory; inChecklist: boolean }[]
): Promise<PlaybookRecord> {
  const version = (await getMaxPlaybookVersion(strategyId)) + 1;

  const row = await prisma.$transaction(async (tx) => {
    const playbook = await tx.playbook.create({
      data: { strategyId, userId, version, summary, status: "DRAFT" },
    });
    await tx.rule.createMany({
      data: rules.map((r, i) => ({
        playbookId:  playbook.id,
        text:        r.text,
        category:    r.category,
        inChecklist: r.inChecklist,
        order:       i,
      })),
    });
    return tx.playbook.findUniqueOrThrow({
      where:   { id: playbook.id },
      include: { rules: true },
    });
  });

  return toPlaybookRecord(row);
}

// Returns the latest non-archived playbook for a strategy.
export async function getLatestPlaybook(
  strategyId: string,
  userId: string
): Promise<PlaybookRecord | null> {
  const row = await prisma.playbook.findFirst({
    where:   { strategyId, status: { not: "ARCHIVED" }, strategy: { userId } },
    orderBy: { version: "desc" },
    include: { rules: true },
  });
  return row ? toPlaybookRecord(row) : null;
}

// Marks a playbook as CONFIRMED and sets confirmedAt.
export async function confirmPlaybook(
  playbookId: string,
  userId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const count = await prisma.playbook.updateMany({
      where: { id: playbookId, status: "DRAFT", strategy: { userId } },
      data:  { status: "CONFIRMED", confirmedAt: new Date() },
    });
    if (count.count === 0) return { success: false, error: "Playbook not found or already confirmed." };
    return { success: true };
  } catch {
    return { success: false, error: "Failed to confirm playbook." };
  }
}

// Updates the text of a rule. Sets source to TRADER_ADDED to track edits.
export async function updateRule(
  ruleId: string,
  playbookId: string,
  userId: string,
  text: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // Verify ownership through the playbook → strategy → user chain.
    const rule = await prisma.rule.findFirst({
      where: { id: ruleId, playbookId, playbook: { strategy: { userId } } },
      select: { id: true },
    });
    if (!rule) return { success: false, error: "Rule not found." };

    await prisma.rule.update({
      where: { id: ruleId },
      data:  { text: text.trim(), source: "TRADER_ADDED" },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update rule." };
  }
}

// Deletes a rule. Verifies ownership.
export async function removeRule(
  ruleId: string,
  playbookId: string,
  userId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const rule = await prisma.rule.findFirst({
      where: { id: ruleId, playbookId, playbook: { strategy: { userId } } },
      select: { id: true },
    });
    if (!rule) return { success: false, error: "Rule not found." };

    await prisma.rule.delete({ where: { id: ruleId } });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to remove rule." };
  }
}

// Toggles the inChecklist flag on a rule.
export async function setRuleChecklist(
  ruleId: string,
  playbookId: string,
  userId: string,
  inChecklist: boolean
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const rule = await prisma.rule.findFirst({
      where: { id: ruleId, playbookId, playbook: { strategy: { userId } } },
      select: { id: true },
    });
    if (!rule) return { success: false, error: "Rule not found." };

    await prisma.rule.update({ where: { id: ruleId }, data: { inChecklist } });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update rule." };
  }
}

// Adds a trader-written rule to a playbook.
export async function addRule(
  playbookId: string,
  userId: string,
  category: RuleCategory,
  text: string
): Promise<{ success: true; rule: PlaybookRule } | { success: false; error: string }> {
  try {
    const playbook = await prisma.playbook.findFirst({
      where:  { id: playbookId, strategy: { userId } },
      select: { id: true, rules: { select: { order: true } } },
    });
    if (!playbook) return { success: false, error: "Playbook not found." };

    const maxOrder = playbook.rules.reduce((m, r) => Math.max(m, r.order), -1);
    const created  = await prisma.rule.create({
      data: {
        playbookId,
        text:        text.trim(),
        category,
        source:      "TRADER_ADDED",
        inChecklist: true,
        order:       maxOrder + 1,
      },
    });
    return { success: true, rule: toRule(created) };
  } catch {
    return { success: false, error: "Failed to add rule." };
  }
}
