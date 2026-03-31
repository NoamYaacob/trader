import type {
  RuleAdherenceRecord,
  CategoryAdherence,
  ReviewResults,
  TradeReviewRecord,
} from "../types";
import { CATEGORY_ORDER } from "@/features/playbook/types";

// Calculates the adherence score from a set of rule adherence rows.
// Score = FOLLOWED / (FOLLOWED + BROKE) * 100.
// NA rules are excluded from the denominator.
// If all rules are NA (or there are no rules), returns 100.
export function calculateAdherenceScore(rows: RuleAdherenceRecord[]): number {
  const followed = rows.filter((r) => r.status === "FOLLOWED").length;
  const broke    = rows.filter((r) => r.status === "BROKE").length;
  const total    = followed + broke;
  if (total === 0) return 100;
  return Math.round((followed / total) * 100);
}

// Builds a full ReviewResults object for the summary page.
export function buildReviewResults(
  review:    TradeReviewRecord,
  adherence: RuleAdherenceRecord[]
): ReviewResults {
  const followed = adherence.filter((r) => r.status === "FOLLOWED").length;
  const broke    = adherence.filter((r) => r.status === "BROKE").length;
  const na       = adherence.filter((r) => r.status === "NA").length;
  const score    = calculateAdherenceScore(adherence);

  // Group by category in canonical display order.
  const categoryMap = new Map<string, RuleAdherenceRecord[]>();
  for (const row of adherence) {
    const list = categoryMap.get(row.ruleCategory) ?? [];
    list.push(row);
    categoryMap.set(row.ruleCategory, list);
  }

  const byCategory: CategoryAdherence[] = CATEGORY_ORDER
    .filter((cat) => categoryMap.has(cat))
    .map((cat) => {
      const rules = categoryMap.get(cat)!;
      return {
        category: cat,
        rules,
        followed: rules.filter((r) => r.status === "FOLLOWED").length,
        broke:    rules.filter((r) => r.status === "BROKE").length,
        na:       rules.filter((r) => r.status === "NA").length,
      };
    });

  return {
    review,
    adherence,
    adherenceScore: score,
    followedCount:  followed,
    brokeCount:     broke,
    naCount:        na,
    byCategory,
  };
}
