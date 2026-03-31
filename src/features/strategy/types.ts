// Types scoped to the Strategy feature.
// The UI layer imports from this file, never directly from Prisma.

export interface StrategyIntakeData {
  instrument:             string;
  timeframe:              string;
  overview:               string;
  entryConditions:        string;
  exitConditions:         string;
  invalidationConditions: string;
  riskRules:              string;
  whatMakesValid:         string;
  whatMakesInvalid:       string;
}

export interface StrategyRecord {
  id:         string;
  intakeStep: number;
  status:     "DRAFT" | "SUBMITTED" | "PROCESSING" | "ACTIVE" | "ARCHIVED" | "FAILED";
  intake:     Partial<StrategyIntakeData>;
  createdAt:  Date;
  updatedAt:  Date;
}

export type IntakeStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const INTAKE_STEPS: Record<
  IntakeStepNumber,
  { title: string; subtitle: string; fields: (keyof StrategyIntakeData)[] }
> = {
  1: {
    title:    "What do you trade?",
    subtitle: "Name the instrument and timeframe at the center of your strategy. Be specific — this anchors every rule we build from here.",
    fields:   ["instrument", "timeframe"],
  },
  2: {
    title:    "How do you trade it?",
    subtitle: "Describe your overall approach in plain language. What is your edge? What market conditions does your strategy depend on? Write freely.",
    fields:   ["overview"],
  },
  3: {
    title:    "When do you enter?",
    subtitle: "List every condition that must be true before you press the button. Price action, structure, context — whatever is part of your read.",
    fields:   ["entryConditions"],
  },
  4: {
    title:    "When do you exit?",
    subtitle: "Your profit target, your stop, and how you manage the position once it is open. Include partials, trailing rules, and time-based exits.",
    fields:   ["exitConditions"],
  },
  5: {
    title:    "What makes you stay out?",
    subtitle: "The conditions that override a setup — that tell you to skip it or exit early. Your invalidation logic is where discipline is built.",
    fields:   ["invalidationConditions"],
  },
  6: {
    title:    "How do you manage risk?",
    subtitle: "Position sizing, maximum loss per trade, daily loss limits, and the hard rules you follow to protect capital regardless of conviction.",
    fields:   ["riskRules"],
  },
  7: {
    title:    "Valid vs marginal setups.",
    subtitle: "What specifically separates a clean, high-quality setup from a borderline one? This becomes the foundation of your training library.",
    fields:   ["whatMakesValid", "whatMakesInvalid"],
  },
};

export const TOTAL_STEPS = 7 as const;
