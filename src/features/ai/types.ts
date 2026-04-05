// AI adapter contract.
// Any AI provider (mock, OpenAI, Anthropic, etc.) must implement AIAdapter.
// The playbook feature calls the adapter through this interface — never directly.

export interface AIPlaybookInput {
  instrument:             string;
  timeframe:              string;
  overview:               string;
  entryConditions:        string;
  exitConditions:         string;
  invalidationConditions: string;
  riskRules:              string;
  whatMakesValid:         string;
  whatMakesInvalid:       string;
  // Optional revision instructions — present when the user edited intake before regenerating.
  revisionNotes?:         string;
}

export interface AIRuleDraft {
  text:        string;
  category:    "ENTRY" | "EXIT" | "INVALIDATION" | "RISK" | "MINDSET";
  inChecklist: boolean;
}

// ── Strategy Spec ─────────────────────────────────────────────────────────────
// Normalized, typed representation of the trader's strategy derived from
// free-text intake. Acts as the canonical intermediate between prose and
// Pine Script generation. Stored as Json on the Playbook model.

export interface StrategySpecMarket {
  instrument:    string;
  timeframe:     string;        // execution timeframe (e.g. "5")
  htfTimeframe:  string | null; // higher-TF structure context (e.g. "15"), null if not mentioned
  sessionFilter: string | null; // exchange-time session string (e.g. "0930-1600"), null if not restricted
}

export interface StrategySpecSwingDef {
  pivotLookback: number;   // bars left+right for ta.pivothigh / ta.pivotlow
  description:   string;
}

export interface StrategySpecSweepRule {
  direction:       "bullish" | "bearish" | "both";
  // Which price level is being swept
  referenceLevel:  "lastSwingLow" | "lastSwingHigh" | "priorSessionLow" | "priorSessionHigh" | "custom";
  customReference: string | null;
  // How sweep close-back is confirmed
  confirmClose:    "sameBar" | "within2Bars";
  atrMargin:       number | null; // ATR multiplier for tolerance; null = exact pierce
}

export interface StrategySpecRejectionRule {
  wickSide:        "lower" | "upper"; // which wick is the rejection wick
  wickToBodyRatio: number;             // wick must be >= N × body size
}

export interface StrategySpecDisplacementRule {
  direction:     "bullish" | "bearish";
  atrMultiplier: number; // candle body >= N × ATR(14)
}

export interface StrategySpecFvgRule {
  type:              "bullish" | "bearish";
  maxBarsAfterSweep: number; // FVG must form within N bars of the sweep
}

export interface StrategySpecEntryModel {
  trigger:          "returnToFvg" | "bosCandle" | "limitAtFvgMidpoint";
  minBarsAfterFvg:  number;  // hard minimum ≥ 1 — entry cannot fire on the FVG formation bar
  requireSignalBar: boolean; // whether a confirming bar inside the FVG is required
}

export interface StrategySpecStopRule {
  placement:  "sweepExtreme" | "beyondFvgBottom" | "atrBeyondSweep";
  atrBuffer:  number; // ATR multiplier beyond the stop anchor
}

export interface StrategySpecTargetModel {
  type:           "rrRatio" | "structuralLevel";
  rrRatio:        number | null;
  structuralDesc: string | null;
}

export interface StrategySpecRiskRules {
  maxRiskPercent: number | null; // % of account per trade
  description:    string;
}

export interface StrategySpecUnresolvedField {
  field:  string; // dot-path to the field that couldn't be resolved (e.g. "sweepRule.atrMargin")
  reason: string; // plain-English explanation of why
}

export interface StrategySpec {
  market:           StrategySpecMarket;
  swingDefinition:  StrategySpecSwingDef    | null;
  sweepRule:        StrategySpecSweepRule   | null;
  rejectionRule:    StrategySpecRejectionRule | null;
  displacementRule: StrategySpecDisplacementRule | null;
  fvgRule:          StrategySpecFvgRule     | null;
  entryModel:       StrategySpecEntryModel  | null;
  stopRule:         StrategySpecStopRule    | null;
  targetModel:      StrategySpecTargetModel | null;
  riskRules:        StrategySpecRiskRules   | null;
  validFilters:     string[];  // conditions that must be present for a valid setup
  marginalFilters:  string[];  // conditions that make a setup marginal — pass
  unresolvedFields: StrategySpecUnresolvedField[];
}

// ── Draft types ───────────────────────────────────────────────────────────────

export interface AIPlaybookDraft {
  summary:         string;
  rules:           AIRuleDraft[];
  // Normalized strategy spec extracted from the intake.
  // null when the strategy is too ambiguous to structure.
  spec?:           StrategySpec | null;
  // AI-generated Pine Script v5 indicator, derived from the spec.
  // null when the strategy cannot be faithfully translated to code.
  pineScript?:     string | null;
  // Clarifications: unresolved spec fields + unautomatable conditions.
  clarifications?: string[];
}

export interface AIAdapter {
  generatePlaybook(input: AIPlaybookInput): Promise<AIPlaybookDraft>;
}
