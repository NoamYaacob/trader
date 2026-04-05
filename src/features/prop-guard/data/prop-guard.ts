import { prisma } from "@/db/client";
import type {
  TraderProfileRecord,
  PropFirmTemplateRecord,
  PropFirmAccountRecord,
  GuardrailsRecord,
  TradingSessionRecord,
  DisciplineEventRecord,
  SafetyState,
  AccountSafetyStatus,
} from "../types";

// ── Mappers ──────────────────────────────────────────────────────────────────

function toTraderProfile(row: {
  id: string; userId: string; traderType: string;
  mainMarket: string | null; platform: string | null; goal: string;
}): TraderProfileRecord {
  return { ...row, traderType: row.traderType as TraderProfileRecord["traderType"], goal: row.goal as TraderProfileRecord["goal"] };
}

function toTemplate(row: {
  id: string; name: string; displayName: string; defaultDailyLoss: number | null;
  eodFlatRule: boolean; trailingDrawdown: boolean; consistencyRule: boolean;
  payoutAvailable: boolean; notes: string | null;
}): PropFirmTemplateRecord {
  return row;
}

function toAccount(row: {
  id: string; userId: string; templateId: string | null; firmName: string;
  accountSize: number; productType: string; dailyLossLimit: number;
  eodFlatRule: boolean; trailingDrawdown: boolean; consistencyRule: boolean;
  payoutMode: boolean; isActive: boolean; notes: string | null;
}): PropFirmAccountRecord {
  return { ...row, productType: row.productType as PropFirmAccountRecord["productType"] };
}

function toGuardrails(row: {
  id: string; userId: string; accountId: string;
  maxDailyLoss: number | null; maxTradesPerDay: number | null;
  maxTradesCount: number | null; maxTradesWindowMin: number | null;
  maxConsecutiveLosses: number | null; cooldownAfterLossMin: number | null;
  noTradeAfterHour: number | null; noSizeIncreaseAfterLoss: boolean; payoutModeEnabled: boolean;
}): GuardrailsRecord {
  return row;
}

function toEvent(row: {
  id: string; sessionId: string; type: string; severity: string; message: string; createdAt: Date;
}): DisciplineEventRecord {
  return {
    ...row,
    type:     row.type     as DisciplineEventRecord["type"],
    severity: row.severity as DisciplineEventRecord["severity"],
  };
}

function toSession(row: {
  id: string; userId: string; accountId: string; date: Date;
  status: string; safetyStatus: string; tradesCount: number; dailyPnl: number;
  dailyLossUsed: number; disciplineScore: number | null; payoutSafetyScore: number | null;
  notes: string | null; completedAt: Date | null;
  events: { id: string; sessionId: string; type: string; severity: string; message: string; createdAt: Date }[];
}): TradingSessionRecord {
  return {
    ...row,
    status:       row.status       as TradingSessionRecord["status"],
    safetyStatus: row.safetyStatus as TradingSessionRecord["safetyStatus"],
    events:       row.events.map(toEvent),
  };
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getTraderProfile(userId: string): Promise<TraderProfileRecord | null> {
  const row = await prisma.traderProfile.findUnique({ where: { userId } });
  return row ? toTraderProfile(row) : null;
}

export async function getAllTemplates(): Promise<PropFirmTemplateRecord[]> {
  const rows = await prisma.propFirmTemplate.findMany({ orderBy: { displayName: "asc" } });
  return rows.map(toTemplate);
}

export async function getActiveAccount(userId: string): Promise<PropFirmAccountRecord | null> {
  const row = await prisma.propFirmAccount.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return row ? toAccount(row) : null;
}

export async function getGuardrails(accountId: string, userId: string): Promise<GuardrailsRecord | null> {
  const row = await prisma.guardrails.findFirst({
    where: { accountId, userId },
  });
  return row ? toGuardrails(row) : null;
}

export async function getTodaySession(
  userId: string, accountId: string
): Promise<TradingSessionRecord | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const row = await prisma.tradingSession.findFirst({
    where: { userId, accountId, date: today },
    include: {
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  return row ? toSession(row) : null;
}

export async function getRecentSessions(
  userId: string, accountId: string, limit = 5
): Promise<TradingSessionRecord[]> {
  const rows = await prisma.tradingSession.findMany({
    where:   { userId, accountId },
    orderBy: { date: "desc" },
    take:    limit,
    include: { events: { orderBy: { createdAt: "asc" } } },
  });
  return rows.map(toSession);
}

// ── Safety computation ────────────────────────────────────────────────────────

export function computeSafetyState(
  session: TradingSessionRecord | null,
  account: PropFirmAccountRecord,
  guardrails: GuardrailsRecord | null
): SafetyState {
  const firmLimit       = account.dailyLossLimit;
  const personalLimit   = guardrails?.maxDailyLoss ?? null;
  const effectiveLimit  = personalLimit != null ? Math.min(firmLimit, personalLimit) : firmLimit;
  const lossUsed        = session?.dailyLossUsed ?? 0;
  const lossRoomLeft    = Math.max(effectiveLimit - lossUsed, 0);
  const lossPercent     = effectiveLimit > 0 ? Math.min((lossUsed / effectiveLimit) * 100, 100) : 0;
  const tradesCount     = session?.tradesCount ?? 0;
  const tradesLimit     = guardrails?.maxTradesPerDay ?? null;
  const payoutMode      = account.payoutMode || (guardrails?.payoutModeEnabled ?? false);

  let status: AccountSafetyStatus = "SAFE";
  if (lossPercent >= 80 || (tradesLimit != null && tradesCount >= tradesLimit)) {
    status = "DANGER";
  } else if (lossPercent >= 50 || (tradesLimit != null && tradesCount >= tradesLimit * 0.8)) {
    status = "WARNING";
  }

  return { status, dailyLossUsed: lossUsed, dailyLossLimit: effectiveLimit, lossRoomLeft, lossPercent, tradesCount, tradesLimit, payoutMode };
}
