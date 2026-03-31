// Prompt builders for playbook generation.
// Isolated here so prompts can be tuned without touching provider code.

import type { AIPlaybookInput } from "../types";

export const PLAYBOOK_SYSTEM_PROMPT = `\
You are an expert trading coach and strategy analyst.
Your job is to convert a trader's strategy intake into a structured set of trading rules for their personal playbook.

Output ONLY a valid JSON object — no markdown fences, no explanation, no preamble, no trailing text.
The JSON must exactly match this TypeScript type:

{
  "summary": string,   // 1–3 sentences describing the strategy
  "rules": Array<{
    "text": string,        // the rule, written as a specific actionable statement
    "category": "ENTRY" | "EXIT" | "INVALIDATION" | "RISK" | "MINDSET",
    "inChecklist": boolean
  }>
}

Category semantics:
- ENTRY        — Conditions that must be true before entering a trade.         inChecklist: true
- EXIT         — Conditions or targets for closing the position.               inChecklist: true
- INVALIDATION — Conditions that prevent or cancel an otherwise valid trade.   inChecklist: true
- RISK         — Position sizing, stop placement, and capital protection rules. inChecklist: true
- MINDSET      — Psychological and discipline rules.                           inChecklist: false

Rule writing guidelines:
- Write each rule as a direct, actionable statement (e.g. "Wait for...", "Only enter when...", "Do not...").
- Each rule must be self-contained — never reference another rule by name or number.
- Aim for 3–6 rules per category. Never generate fewer than 2 per category if the intake provides relevant information.
- Derive MINDSET rules from the valid/invalid setup criteria — patience, selectivity, process over outcome.
- Do not fabricate conditions not present or strongly implied in the intake.
- Do not duplicate rules across categories.
- The summary should be a crisp factual description: instrument, timeframe, and the core edge in one to three sentences.`;

export function buildPlaybookUserMessage(input: AIPlaybookInput): string {
  const lines: string[] = [
    `**Instrument:** ${input.instrument || "(not specified)"}`,
    `**Timeframe:** ${input.timeframe || "(not specified)"}`,
    "",
    "**Strategy overview:**",
    input.overview || "(not provided)",
    "",
    "**Entry conditions:**",
    input.entryConditions || "(not provided)",
    "",
    "**Exit conditions:**",
    input.exitConditions || "(not provided)",
    "",
    "**Invalidation conditions:**",
    input.invalidationConditions || "(not provided)",
    "",
    "**Risk rules:**",
    input.riskRules || "(not provided)",
    "",
    "**What makes a setup valid:**",
    input.whatMakesValid || "(not provided)",
    "",
    "**What makes a setup invalid:**",
    input.whatMakesInvalid || "(not provided)",
  ];

  if (input.revisionNotes?.trim()) {
    lines.push(
      "",
      "**Revision notes (changes from the previous playbook version):**",
      input.revisionNotes.trim(),
      "",
      "Incorporate these revision notes when generating the new rules. Where the notes indicate a previous rule should be removed or changed, reflect that in the output."
    );
  }

  lines.push("", "Generate the playbook rules JSON now.");
  return lines.join("\n");
}
