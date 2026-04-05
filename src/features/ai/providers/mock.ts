import type { AIAdapter, AIPlaybookInput, AIPlaybookDraft, AIRuleDraft } from "../types";

// Splits a block of text into individual rule strings.
// Tries line-by-line first; falls back to sentence splitting.
function extractLines(text: string, max: number): string[] {
  if (!text.trim()) return [];
  const byLine = text
    .split(/\n+/)
    .map((s) => s.replace(/^[-•*\d.):\s]+/, "").trim())
    .filter((s) => s.length > 8);
  if (byLine.length >= 1) return byLine.slice(0, max);
  return text
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
    .slice(0, max);
}

// The mock provider converts intake text directly into rule cards.
// It does not call any external API. Used as the default in development
// and in tests. Replace with a real provider by swapping the adapter
// instance in src/features/ai/index.ts.
class MockAIProvider implements AIAdapter {
  async generatePlaybook(input: AIPlaybookInput): Promise<AIPlaybookDraft> {
    const instrument = input.instrument || "this instrument";
    const timeframe  = input.timeframe  || "this timeframe";

    const revisionClause = input.revisionNotes?.trim()
      ? ` Regenerated with revision notes: "${input.revisionNotes.trim()}"`
      : "";

    const summary =
      `A ${instrument} strategy traded on the ${timeframe} timeframe. ` +
      (input.overview.trim()
        ? input.overview.trim().split(/\.\s+/)[0] + "."
        : "Rules generated from your intake responses.") +
      revisionClause;

    const rules: AIRuleDraft[] = [];

    // ENTRY
    for (const text of extractLines(input.entryConditions, 5)) {
      rules.push({ text, category: "ENTRY", inChecklist: true });
    }
    if (rules.filter((r) => r.category === "ENTRY").length === 0) {
      rules.push({
        text:        `Enter only when price structure on ${timeframe} confirms the setup.`,
        category:    "ENTRY",
        inChecklist: true,
      });
    }

    // EXIT
    for (const text of extractLines(input.exitConditions, 4)) {
      rules.push({ text, category: "EXIT", inChecklist: true });
    }
    if (rules.filter((r) => r.category === "EXIT").length === 0) {
      rules.push({
        text:        "Exit at the predetermined target or when the setup structure breaks.",
        category:    "EXIT",
        inChecklist: true,
      });
    }

    // INVALIDATION
    for (const text of extractLines(input.invalidationConditions, 4)) {
      rules.push({ text, category: "INVALIDATION", inChecklist: true });
    }
    if (rules.filter((r) => r.category === "INVALIDATION").length === 0) {
      rules.push({
        text:        "Do not take the trade if the primary condition is absent.",
        category:    "INVALIDATION",
        inChecklist: false,
      });
    }

    // RISK
    for (const text of extractLines(input.riskRules, 4)) {
      rules.push({ text, category: "RISK", inChecklist: true });
    }
    if (rules.filter((r) => r.category === "RISK").length === 0) {
      rules.push({
        text:        "Risk a fixed percentage of account per trade. Never add to a losing position.",
        category:    "RISK",
        inChecklist: true,
      });
    }

    // MINDSET — derived from whatMakesValid/Invalid framing
    const validLines   = extractLines(input.whatMakesValid,   2);
    const invalidLines = extractLines(input.whatMakesInvalid, 2);
    if (validLines.length > 0) {
      rules.push({
        text:        `Only trade setups that meet the full valid criteria: ${validLines[0].toLowerCase()}`,
        category:    "MINDSET",
        inChecklist: false,
      });
    }
    if (invalidLines.length > 0) {
      rules.push({
        text:        `Skip the trade if any invalidation condition is present: ${invalidLines[0].toLowerCase()}`,
        category:    "MINDSET",
        inChecklist: false,
      });
    }
    if (rules.filter((r) => r.category === "MINDSET").length === 0) {
      rules.push({
        text:        "Do not force setups. If in doubt, the answer is no.",
        category:    "MINDSET",
        inChecklist: false,
      });
    }

    // Stub Pine Script — references the instrument/timeframe from intake.
    // A real provider generates this from actual entry conditions.
    const pineScript = [
      `//@version=5`,
      `indicator("${instrument} Strategy Signal [Mock]", overlay=true)`,
      ``,
      `// ── Inputs ────────────────────────────────────────────────────────────`,
      `fastLen = input.int(9,  "Fast EMA length")`,
      `slowLen = input.int(21, "Slow EMA length")`,
      ``,
      `// ── Calculations ──────────────────────────────────────────────────────`,
      `fastEma = ta.ema(close, fastLen)`,
      `slowEma = ta.ema(close, slowLen)`,
      ``,
      `// Entry signal: fast EMA crosses above slow EMA`,
      `longSignal = ta.crossover(fastEma, slowEma)`,
      ``,
      `// ── Plots ─────────────────────────────────────────────────────────────`,
      `plot(fastEma, "Fast EMA", color=color.new(color.yellow, 0),  linewidth=1)`,
      `plot(slowEma, "Slow EMA", color=color.new(color.gray,   40), linewidth=1)`,
      ``,
      `plotshape(longSignal, "Long Signal",`,
      `  style=shape.triangleup, location=location.belowbar,`,
      `  color=color.new(color.lime, 0), size=size.small)`,
    ].join("\n");

    const clarifications = [
      `This is a mock Pine Script generated for the "${instrument}" strategy on the "${timeframe}" timeframe.`,
      "Replace the EMA crossover logic with your actual entry conditions before using this on a live chart.",
    ];

    return { summary, rules, pineScript, clarifications };
  }
}

export const mockAIProvider: AIAdapter = new MockAIProvider();
