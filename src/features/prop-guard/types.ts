// PropGuard domain types.
// Pages import from here, never directly from Prisma.

export type TraderType  = "SCALPER" | "INTRADAY" | "SWING";
export type TraderGoal  = "PASS_EVAL" | "PROTECT_FUNDED" | "REACH_PAYOUT" | "IMPROVE_DISCIPLINE";
export type PropProductType = "EVALUATION" | "FUNDED" | "EXPRESS";
export type SessionStatus   = "ACTIVE" | "COMPLETED";
export type AccountSafetyStatus = "SAFE" | "WARNING" | "DANGER";
export type DisciplineEventType =
  | "OVERTRADING_WARNING"
  | "RAPID_FIRE_WARNING"
  | "DAILY_LOSS_WARNING"
  | "DAILY_LOSS_CRITICAL"
  | "LOSS_STREAK_WARNING"
  | "OUTSIDE_HOURS_WARNING"
  | "PAYOUT_VIOLATION_WARNING"
  | "COOLDOWN_TRIGGERED"
  | "MANUAL_NOTE";
export type DisciplineSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface TraderProfileRecord {
  id:          string;
  userId:      string;
  traderType:  TraderType;
  mainMarket:  string | null;
  platform:    string | null;
  goal:        TraderGoal;
}

export interface PropFirmTemplateRecord {
  id:               string;
  name:             string;
  displayName:      string;
  defaultDailyLoss: number | null;
  eodFlatRule:      boolean;
  trailingDrawdown: boolean;
  consistencyRule:  boolean;
  payoutAvailable:  boolean;
  notes:            string | null;
}

export interface PropFirmAccountRecord {
  id:               string;
  userId:           string;
  templateId:       string | null;
  firmName:         string;
  accountSize:      number;
  productType:      PropProductType;
  dailyLossLimit:   number;
  eodFlatRule:      boolean;
  trailingDrawdown: boolean;
  consistencyRule:  boolean;
  payoutMode:       boolean;
  isActive:         boolean;
  notes:            string | null;
}

export interface GuardrailsRecord {
  id:                      string;
  userId:                  string;
  accountId:               string;
  maxDailyLoss:            number | null;
  maxTradesPerDay:         number | null;
  maxTradesCount:          number | null;
  maxTradesWindowMin:      number | null;
  maxConsecutiveLosses:    number | null;
  cooldownAfterLossMin:    number | null;
  noTradeAfterHour:        number | null;
  noSizeIncreaseAfterLoss: boolean;
  payoutModeEnabled:       boolean;
}

export interface TradingSessionRecord {
  id:                string;
  userId:            string;
  accountId:         string;
  date:              Date;
  status:            SessionStatus;
  safetyStatus:      AccountSafetyStatus;
  tradesCount:       number;
  dailyPnl:          number;
  dailyLossUsed:     number;
  disciplineScore:   number | null;
  payoutSafetyScore: number | null;
  notes:             string | null;
  completedAt:       Date | null;
  events:            DisciplineEventRecord[];
}

export interface DisciplineEventRecord {
  id:        string;
  sessionId: string;
  type:      DisciplineEventType;
  severity:  DisciplineSeverity;
  message:   string;
  createdAt: Date;
}

// Computed safety state — derived from session + account + guardrails
export interface SafetyState {
  status:          AccountSafetyStatus;
  dailyLossUsed:   number;
  dailyLossLimit:  number;   // effective limit (min of firm + personal)
  lossRoomLeft:    number;
  lossPercent:     number;   // 0–100
  tradesCount:     number;
  tradesLimit:     number | null;
  payoutMode:      boolean;
}

// Human-readable labels
export const TRADER_TYPE_LABELS: Record<TraderType, string> = {
  SCALPER:  "Scalper",
  INTRADAY: "Intraday",
  SWING:    "Swing",
};

export const TRADER_GOAL_LABELS: Record<TraderGoal, string> = {
  PASS_EVAL:          "Pass evaluation",
  PROTECT_FUNDED:     "Protect funded account",
  REACH_PAYOUT:       "Reach payout",
  IMPROVE_DISCIPLINE: "Improve discipline",
};

export const PRODUCT_TYPE_LABELS: Record<PropProductType, string> = {
  EVALUATION: "Evaluation",
  FUNDED:     "Funded",
  EXPRESS:    "Express / Instant",
};

export const DISCIPLINE_EVENT_LABELS: Record<DisciplineEventType, string> = {
  OVERTRADING_WARNING:     "Overtrading",
  RAPID_FIRE_WARNING:      "Rapid-fire trades",
  DAILY_LOSS_WARNING:      "Daily loss warning",
  DAILY_LOSS_CRITICAL:     "Daily loss critical",
  LOSS_STREAK_WARNING:     "Loss streak",
  OUTSIDE_HOURS_WARNING:   "Outside allowed hours",
  PAYOUT_VIOLATION_WARNING:"Payout mode violation",
  COOLDOWN_TRIGGERED:      "Cooldown triggered",
  MANUAL_NOTE:             "Note",
};
