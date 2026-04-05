"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/db/client";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session.user.id;
}

// ── Trader Profile ────────────────────────────────────────────────────────────

export async function saveTraderProfile(formData: FormData): Promise<never> {
  const userId = await requireUserId();

  const traderType  = formData.get("traderType")  as string;
  const goal        = formData.get("goal")         as string;
  const mainMarket  = (formData.get("mainMarket")  as string | null)?.trim() || null;
  const platform    = (formData.get("platform")    as string | null)?.trim() || null;

  await prisma.traderProfile.upsert({
    where:  { userId },
    create: { userId, traderType: traderType as never, goal: goal as never, mainMarket, platform },
    update: { traderType: traderType as never, goal: goal as never, mainMarket, platform },
  });

  redirect("/setup/firm");
}

// ── Prop Firm Account ─────────────────────────────────────────────────────────

export async function savePropFirmAccount(formData: FormData): Promise<never> {
  const userId = await requireUserId();

  const templateId     = (formData.get("templateId")     as string | null) || null;
  const firmName       = (formData.get("firmName")        as string).trim();
  const accountSize    = parseFloat(formData.get("accountSize") as string);
  const productType    = formData.get("productType")    as string;
  const dailyLossLimit = parseFloat(formData.get("dailyLossLimit") as string);
  const eodFlatRule    = formData.get("eodFlatRule")    === "on";
  const trailingDrawdown = formData.get("trailingDrawdown") === "on";
  const consistencyRule  = formData.get("consistencyRule")  === "on";

  // Deactivate existing accounts before creating the new one
  await prisma.propFirmAccount.updateMany({
    where: { userId, isActive: true },
    data:  { isActive: false },
  });

  await prisma.propFirmAccount.create({
    data: {
      userId, templateId, firmName, accountSize,
      productType: productType as never, dailyLossLimit,
      eodFlatRule, trailingDrawdown, consistencyRule,
      isActive: true,
    },
  });

  redirect("/setup/guardrails");
}

// ── Guardrails ────────────────────────────────────────────────────────────────

export async function saveGuardrails(formData: FormData): Promise<never> {
  const userId = await requireUserId();

  const account = await prisma.propFirmAccount.findFirst({
    where: { userId, isActive: true },
    select: { id: true },
  });
  if (!account) redirect("/setup/firm");

  function optInt(key: string): number | null {
    const v = (formData.get(key) as string | null)?.trim();
    if (!v) return null;
    const n = parseInt(v, 10);
    return isNaN(n) ? null : n;
  }
  function optFloat(key: string): number | null {
    const v = (formData.get(key) as string | null)?.trim();
    if (!v) return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  await prisma.guardrails.upsert({
    where:  { accountId: account.id },
    create: {
      userId,
      accountId:               account.id,
      maxDailyLoss:            optFloat("maxDailyLoss"),
      maxTradesPerDay:         optInt("maxTradesPerDay"),
      maxTradesCount:          optInt("maxTradesCount"),
      maxTradesWindowMin:      optInt("maxTradesWindowMin"),
      maxConsecutiveLosses:    optInt("maxConsecutiveLosses"),
      cooldownAfterLossMin:    optInt("cooldownAfterLossMin"),
      noTradeAfterHour:        optInt("noTradeAfterHour"),
      noSizeIncreaseAfterLoss: formData.get("noSizeIncreaseAfterLoss") === "on",
      payoutModeEnabled:       formData.get("payoutModeEnabled")       === "on",
    },
    update: {
      maxDailyLoss:            optFloat("maxDailyLoss"),
      maxTradesPerDay:         optInt("maxTradesPerDay"),
      maxTradesCount:          optInt("maxTradesCount"),
      maxTradesWindowMin:      optInt("maxTradesWindowMin"),
      maxConsecutiveLosses:    optInt("maxConsecutiveLosses"),
      cooldownAfterLossMin:    optInt("cooldownAfterLossMin"),
      noTradeAfterHour:        optInt("noTradeAfterHour"),
      noSizeIncreaseAfterLoss: formData.get("noSizeIncreaseAfterLoss") === "on",
      payoutModeEnabled:       formData.get("payoutModeEnabled")       === "on",
    },
  });

  redirect("/dashboard");
}

// ── Trading Session ───────────────────────────────────────────────────────────

export async function upsertTodaySession(formData: FormData): Promise<never> {
  const userId = await requireUserId();

  const account = await prisma.propFirmAccount.findFirst({
    where: { userId, isActive: true },
    select: { id: true },
  });
  if (!account) redirect("/setup/firm");

  const tradesCount  = parseInt((formData.get("tradesCount") as string) || "0", 10);
  const dailyPnl     = parseFloat((formData.get("dailyPnl")    as string) || "0");
  const dailyLossUsed = dailyPnl < 0 ? Math.abs(dailyPnl) : 0;
  const notes        = (formData.get("notes") as string | null)?.trim() || null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Compute safety status based on firm + guardrails
  const account2 = await prisma.propFirmAccount.findUnique({
    where: { id: account.id },
    select: { dailyLossLimit: true, payoutMode: true },
  });
  const guardrails = await prisma.guardrails.findFirst({
    where: { accountId: account.id, userId },
    select: { maxDailyLoss: true, maxTradesPerDay: true },
  });

  const effectiveLimit  = Math.min(
    account2?.dailyLossLimit ?? Infinity,
    guardrails?.maxDailyLoss ?? Infinity
  );
  const lossPercent = effectiveLimit > 0 ? (dailyLossUsed / effectiveLimit) * 100 : 0;
  const tradesLimit = guardrails?.maxTradesPerDay ?? null;

  let safetyStatus: "SAFE" | "WARNING" | "DANGER" = "SAFE";
  if (lossPercent >= 80 || (tradesLimit != null && tradesCount >= tradesLimit)) {
    safetyStatus = "DANGER";
  } else if (lossPercent >= 50 || (tradesLimit != null && tradesCount >= tradesLimit * 0.8)) {
    safetyStatus = "WARNING";
  }

  await prisma.tradingSession.upsert({
    where:  { userId_accountId_date: { userId, accountId: account.id, date: today } },
    create: { userId, accountId: account.id, date: today, tradesCount, dailyPnl, dailyLossUsed, safetyStatus, notes },
    update: { tradesCount, dailyPnl, dailyLossUsed, safetyStatus, notes },
  });

  redirect("/session");
}

export async function completeSession(sessionId: string): Promise<never> {
  const userId = await requireUserId();

  const session = await prisma.tradingSession.findFirst({
    where:   { id: sessionId, userId },
    include: { events: true },
  });
  if (!session) redirect("/session");

  // Simple discipline score: starts at 100, deduct per warning event
  const deductions = { INFO: 0, WARNING: 10, CRITICAL: 25 };
  const eventDeduction = session.events.reduce((sum, e) => sum + (deductions[e.severity as keyof typeof deductions] ?? 0), 0);
  const disciplineScore   = Math.max(0, 100 - eventDeduction);
  const payoutSafetyScore = session.safetyStatus === "SAFE" ? 100 : session.safetyStatus === "WARNING" ? 60 : 20;

  await prisma.tradingSession.update({
    where: { id: sessionId },
    data: { status: "COMPLETED", completedAt: new Date(), disciplineScore, payoutSafetyScore },
  });

  redirect("/session");
}

export async function logManualNote(sessionId: string, message: string): Promise<never> {
  const userId = await requireUserId();
  await prisma.disciplineEvent.create({
    data: { sessionId, userId, type: "MANUAL_NOTE", severity: "INFO", message },
  });
  redirect("/session");
}
