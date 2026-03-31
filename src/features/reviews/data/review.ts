import { prisma } from "@/db/client";
import type {
  TradeReviewRecord,
  RuleAdherenceRecord,
  TradeFormInput,
  RuleAdherenceInput,
  ReviewSummary,
  ChecklistRuleForReview,
} from "../types";
import type { RuleCategory } from "@/features/playbook/types";
import { calculateAdherenceScore } from "../domain/scoring";

// ── Mappers ────────────────────────────────────────────────────────────────

function toReviewRecord(row: {
  id:             string;
  playbookId:     string;
  setupId:        string | null;
  instrument:     string;
  direction:      string;
  tradeDate:      Date;
  notes:          string | null;
  adherenceScore: number | null;
  status:         string;
  completedAt:    Date | null;
  createdAt:      Date;
}): TradeReviewRecord {
  return {
    id:             row.id,
    playbookId:     row.playbookId,
    setupId:        row.setupId,
    instrument:     row.instrument,
    direction:      row.direction as "LONG" | "SHORT",
    tradeDate:      row.tradeDate,
    notes:          row.notes,
    adherenceScore: row.adherenceScore,
    status:         row.status as "DRAFT" | "COMPLETE",
    completedAt:    row.completedAt,
    createdAt:      row.createdAt,
  };
}

function toAdherenceRecord(row: {
  id:           string;
  reviewId:     string;
  ruleId:       string;
  ruleText:     string;
  ruleCategory: string;
  status:       string;
  notes:        string | null;
}): RuleAdherenceRecord {
  return {
    id:           row.id,
    reviewId:     row.reviewId,
    ruleId:       row.ruleId,
    ruleText:     row.ruleText,
    ruleCategory: row.ruleCategory as RuleCategory,
    status:       row.status as "FOLLOWED" | "BROKE" | "NA",
    notes:        row.notes,
  };
}

// ── Queries ────────────────────────────────────────────────────────────────

// Returns an existing review (verifies ownership).
export async function getTradeReview(
  reviewId: string,
  userId: string
): Promise<TradeReviewRecord | null> {
  const row = await prisma.tradeReview.findFirst({
    where: { id: reviewId, userId },
  });
  return row ? toReviewRecord(row) : null;
}

// Returns all adherence rows for a review.
export async function getReviewAdherence(
  reviewId: string
): Promise<RuleAdherenceRecord[]> {
  const rows = await prisma.ruleAdherence.findMany({
    where:   { reviewId },
    orderBy: { id: "asc" },
  });
  return rows.map(toAdherenceRecord);
}

// Returns the checklist rules (inChecklist: true) for a playbook.
export async function getChecklistRules(
  playbookId: string
): Promise<ChecklistRuleForReview[]> {
  const rows = await prisma.rule.findMany({
    where:   { playbookId, inChecklist: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select:  { id: true, text: true, category: true },
  });
  return rows.map((r) => ({
    id:       r.id,
    text:     r.text,
    category: r.category as RuleCategory,
  }));
}

// Compact list for the review landing page and dashboard.
export async function getReviewSummaries(
  userId: string,
  limit?: number
): Promise<ReviewSummary[]> {
  const rows = await prisma.tradeReview.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    take:    limit,
    include: {
      setup: { select: { name: true } },
    },
  });
  return rows.map((row) => ({
    id:             row.id,
    instrument:     row.instrument,
    direction:      row.direction as "LONG" | "SHORT",
    tradeDate:      row.tradeDate,
    adherenceScore: row.adherenceScore,
    status:         row.status as "DRAFT" | "COMPLETE",
    setupName:      row.setup?.name ?? null,
    completedAt:    row.completedAt,
    createdAt:      row.createdAt,
  }));
}

// ── Mutations ──────────────────────────────────────────────────────────────

// Creates a new DRAFT TradeReview and returns it.
export async function createTradeReview(
  userId: string,
  playbookId: string,
  input: TradeFormInput
): Promise<TradeReviewRecord> {
  const row = await prisma.tradeReview.create({
    data: {
      userId,
      playbookId,
      setupId:   input.setupId ?? null,
      instrument: input.instrument.trim(),
      direction:  input.direction,
      tradeDate:  new Date(input.tradeDate),
      notes:      input.notes?.trim() || null,
    },
  });
  return toReviewRecord(row);
}

// Saves adherence rows and marks the review COMPLETE.
// Returns the computed adherenceScore.
export async function completeTradeReview(
  reviewId: string,
  userId: string,
  inputs: RuleAdherenceInput[],
  checklistRules: ChecklistRuleForReview[]
): Promise<{ adherenceScore: number } | { error: string }> {
  const review = await prisma.tradeReview.findFirst({
    where:  { id: reviewId, userId, status: "DRAFT" },
    select: { id: true },
  });
  if (!review) return { error: "Review not found or already complete." };

  // Build adherence records with snapshotted text and category.
  const ruleMap = new Map(checklistRules.map((r) => [r.id, r]));
  const adherenceData = inputs
    .map((inp) => {
      const rule = ruleMap.get(inp.ruleId);
      if (!rule) return null;
      return {
        reviewId,
        ruleId:       inp.ruleId,
        ruleText:     rule.text,
        ruleCategory: rule.category,
        status:       inp.status,
        notes:        inp.notes?.trim() || null,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  // Compute score from the inputs.
  const tempRows = adherenceData.map((d, i) => ({
    id:           String(i),
    reviewId,
    ruleId:       d.ruleId,
    ruleText:     d.ruleText,
    ruleCategory: d.ruleCategory as RuleCategory,
    status:       d.status as "FOLLOWED" | "BROKE" | "NA",
    notes:        d.notes,
  }));
  const score = calculateAdherenceScore(tempRows);

  await prisma.$transaction([
    prisma.ruleAdherence.createMany({ data: adherenceData }),
    prisma.tradeReview.update({
      where: { id: reviewId },
      data: {
        adherenceScore: score,
        status:         "COMPLETE",
        completedAt:    new Date(),
      },
    }),
  ]);

  return { adherenceScore: score };
}

// Updates editable trade metadata on a completed review.
// Adherence marks are intentionally not editable — they form the historical record.
export async function updateReviewDetails(
  reviewId: string,
  userId: string,
  input: Pick<TradeFormInput, "instrument" | "direction" | "tradeDate" | "notes">
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const count = await prisma.tradeReview.updateMany({
      where: { id: reviewId, userId },
      data: {
        instrument: input.instrument.trim(),
        direction:  input.direction,
        tradeDate:  new Date(input.tradeDate),
        notes:      input.notes?.trim() || null,
      },
    });
    if (count.count === 0) return { success: false, error: "Review not found." };
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update review." };
  }
}

// Hard-deletes a review (cascades to RuleAdherence rows via DB constraint).
export async function deleteReview(
  reviewId: string,
  userId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const count = await prisma.tradeReview.deleteMany({
      where: { id: reviewId, userId },
    });
    if (count.count === 0) return { success: false, error: "Review not found." };
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete review." };
  }
}
