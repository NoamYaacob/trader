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
  status:     "DRAFT" | "SUBMITTED" | "PROCESSING" | "ACTIVE" | "ARCHIVED";
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
    title:    "Instrument & Timeframe",
    subtitle: "What do you trade, and on which timeframe?",
    fields:   ["instrument", "timeframe"],
  },
  2: {
    title:    "Strategy Overview",
    subtitle: "Describe your overall trading approach in your own words.",
    fields:   ["overview"],
  },
  3: {
    title:    "Entry Conditions",
    subtitle: "What conditions must be true before you enter a trade?",
    fields:   ["entryConditions"],
  },
  4: {
    title:    "Exit Conditions",
    subtitle: "What is your target? When and how do you exit?",
    fields:   ["exitConditions"],
  },
  5: {
    title:    "Invalidation Conditions",
    subtitle: "What would make you not take this trade, or exit early?",
    fields:   ["invalidationConditions"],
  },
  6: {
    title:    "Risk Rules",
    subtitle: "Your position sizing, max loss, and trade management rules.",
    fields:   ["riskRules"],
  },
  7: {
    title:    "Setup Recognition",
    subtitle: "What specifically distinguishes a valid setup from an invalid one?",
    fields:   ["whatMakesValid", "whatMakesInvalid"],
  },
};

export const TOTAL_STEPS = 7 as const;
