// Types scoped to the Playbook feature.
// The UI layer imports from this file, never directly from Prisma.

export type { StrategySpec } from "@/features/ai/types";

export type RuleCategory  = "ENTRY" | "EXIT" | "INVALIDATION" | "RISK" | "MINDSET";
export type RuleSource    = "AI_GENERATED" | "TRADER_ADDED";
export type PlaybookStatus = "DRAFT" | "CONFIRMED" | "ARCHIVED";

export interface PlaybookRule {
  id:          string;
  text:        string;
  category:    RuleCategory;
  source:      RuleSource;
  inChecklist: boolean;
  order:       number;
}

export interface PlaybookRecord {
  id:               string;
  strategyId:       string;
  version:          number;
  summary:          string | null;
  status:           PlaybookStatus;
  confirmedAt:      Date | null;
  rules:            PlaybookRule[];
  pineScript:       string | null;
  pineScriptNotes:  string | null;
  // Normalized strategy spec extracted by the AI from free-text intake.
  // null for playbooks generated before the spec layer was introduced.
  spec:             import("@/features/ai/types").StrategySpec | null;
  createdAt:        Date;
  updatedAt:        Date;
}

export const CATEGORY_LABELS: Record<RuleCategory, string> = {
  ENTRY:        "Entry conditions",
  EXIT:         "Exit conditions",
  INVALIDATION: "Invalidation",
  RISK:         "Risk management",
  MINDSET:      "Mindset",
};

// Display order of categories in the review UI.
export const CATEGORY_ORDER: RuleCategory[] = [
  "ENTRY",
  "EXIT",
  "INVALIDATION",
  "RISK",
  "MINDSET",
];
