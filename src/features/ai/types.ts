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
  // A real provider uses these as extra context; the mock appends them to the summary.
  revisionNotes?:         string;
}

export interface AIRuleDraft {
  text:        string;
  category:    "ENTRY" | "EXIT" | "INVALIDATION" | "RISK" | "MINDSET";
  inChecklist: boolean;
}

export interface AIPlaybookDraft {
  summary: string;
  rules:   AIRuleDraft[];
}

export interface AIAdapter {
  generatePlaybook(input: AIPlaybookInput): Promise<AIPlaybookDraft>;
}
