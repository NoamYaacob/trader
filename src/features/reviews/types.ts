// Types scoped to the Trade Review feature.

import type { RuleCategory } from "@/features/playbook/types";

export type TradeDirection  = "LONG" | "SHORT";
export type ReviewStatus    = "DRAFT" | "COMPLETE";
export type AdherenceStatus = "FOLLOWED" | "BROKE" | "NA";

// ── Records ────────────────────────────────────────────────────────────────

export interface TradeReviewRecord {
  id:             string;
  playbookId:     string;
  setupId:        string | null;
  instrument:     string;
  direction:      TradeDirection;
  tradeDate:      Date;
  notes:          string | null;
  adherenceScore: number | null;
  status:         ReviewStatus;
  completedAt:    Date | null;
  createdAt:      Date;
}

export interface RuleAdherenceRecord {
  id:           string;
  reviewId:     string;
  ruleId:       string;
  ruleText:     string;
  ruleCategory: RuleCategory;
  status:       AdherenceStatus;
  notes:        string | null;
}

// ── Form input types ───────────────────────────────────────────────────────

export interface TradeFormInput {
  instrument: string;
  direction:  TradeDirection;
  tradeDate:  string; // ISO date string "YYYY-MM-DD"
  setupId:    string | null;
  notes:      string | null;
}

// Per-rule input submitted from the adherence form.
export interface RuleAdherenceInput {
  ruleId:   string;
  status:   AdherenceStatus;
  notes:    string | null;
}

// ── View types ─────────────────────────────────────────────────────────────

// What the adherence form page needs per rule.
export interface ChecklistRuleForReview {
  id:       string;
  text:     string;
  category: RuleCategory;
}

// Results derived for the summary view.
export interface ReviewResults {
  review:          TradeReviewRecord;
  adherence:       RuleAdherenceRecord[];
  adherenceScore:  number;
  followedCount:   number;
  brokeCount:      number;
  naCount:         number;
  byCategory:      CategoryAdherence[];
}

export interface CategoryAdherence {
  category:  RuleCategory;
  rules:     RuleAdherenceRecord[];
  followed:  number;
  broke:     number;
  na:        number;
}

// Compact summary shown on the list page and dashboard.
export interface ReviewSummary {
  id:             string;
  instrument:     string;
  direction:      TradeDirection;
  tradeDate:      Date;
  adherenceScore: number | null;
  status:         ReviewStatus;
  setupName:      string | null;
  completedAt:    Date | null;
  createdAt:      Date;
}
