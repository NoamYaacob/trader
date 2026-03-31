import type { PlaybookRule, RuleCategory } from "../types";
import { CATEGORY_ORDER } from "../types";

// Groups a flat list of rules by category, preserving display order.
export function groupRulesByCategory(
  rules: PlaybookRule[]
): Map<RuleCategory, PlaybookRule[]> {
  const map = new Map<RuleCategory, PlaybookRule[]>();
  for (const cat of CATEGORY_ORDER) map.set(cat, []);
  for (const rule of rules) {
    map.get(rule.category)?.push(rule);
  }
  return map;
}

// Returns only the rules marked for the pre-trade checklist.
export function getChecklistRules(rules: PlaybookRule[]): PlaybookRule[] {
  return rules.filter((r) => r.inChecklist);
}
