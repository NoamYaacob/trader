-- PropGuard MVP: new models for discipline and risk protection.

-- Enums
CREATE TYPE "TraderType" AS ENUM ('SCALPER', 'INTRADAY', 'SWING');
CREATE TYPE "TraderGoal" AS ENUM ('PASS_EVAL', 'PROTECT_FUNDED', 'REACH_PAYOUT', 'IMPROVE_DISCIPLINE');
CREATE TYPE "PropProductType" AS ENUM ('EVALUATION', 'FUNDED', 'EXPRESS');
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED');
CREATE TYPE "AccountSafetyStatus" AS ENUM ('SAFE', 'WARNING', 'DANGER');
CREATE TYPE "DisciplineEventType" AS ENUM (
  'OVERTRADING_WARNING', 'RAPID_FIRE_WARNING', 'DAILY_LOSS_WARNING',
  'DAILY_LOSS_CRITICAL', 'LOSS_STREAK_WARNING', 'OUTSIDE_HOURS_WARNING',
  'PAYOUT_VIOLATION_WARNING', 'COOLDOWN_TRIGGERED', 'MANUAL_NOTE'
);
CREATE TYPE "DisciplineSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- PropFirmTemplate: seeded list of known prop firms with default rules
CREATE TABLE "PropFirmTemplate" (
  "id"               TEXT NOT NULL,
  "name"             TEXT NOT NULL,
  "displayName"      TEXT NOT NULL,
  "defaultDailyLoss" DOUBLE PRECISION,
  "eodFlatRule"      BOOLEAN NOT NULL DEFAULT false,
  "trailingDrawdown" BOOLEAN NOT NULL DEFAULT false,
  "consistencyRule"  BOOLEAN NOT NULL DEFAULT false,
  "payoutAvailable"  BOOLEAN NOT NULL DEFAULT true,
  "notes"            TEXT,
  CONSTRAINT "PropFirmTemplate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PropFirmTemplate_name_key" ON "PropFirmTemplate"("name");

-- TraderProfile: one per user
CREATE TABLE "TraderProfile" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "traderType"  "TraderType" NOT NULL,
  "mainMarket"  TEXT,
  "platform"    TEXT,
  "goal"        "TraderGoal" NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TraderProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TraderProfile_userId_key" ON "TraderProfile"("userId");
ALTER TABLE "TraderProfile" ADD CONSTRAINT "TraderProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PropFirmAccount: user's account at a prop firm
CREATE TABLE "PropFirmAccount" (
  "id"               TEXT NOT NULL,
  "userId"           TEXT NOT NULL,
  "templateId"       TEXT,
  "firmName"         TEXT NOT NULL,
  "accountSize"      DOUBLE PRECISION NOT NULL,
  "productType"      "PropProductType" NOT NULL DEFAULT 'EVALUATION',
  "dailyLossLimit"   DOUBLE PRECISION NOT NULL,
  "eodFlatRule"      BOOLEAN NOT NULL DEFAULT false,
  "trailingDrawdown" BOOLEAN NOT NULL DEFAULT false,
  "consistencyRule"  BOOLEAN NOT NULL DEFAULT false,
  "payoutMode"       BOOLEAN NOT NULL DEFAULT false,
  "isActive"         BOOLEAN NOT NULL DEFAULT true,
  "notes"            TEXT,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PropFirmAccount_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "PropFirmAccount" ADD CONSTRAINT "PropFirmAccount_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PropFirmAccount" ADD CONSTRAINT "PropFirmAccount_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "PropFirmTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Guardrails: personal risk rules, one per account
CREATE TABLE "Guardrails" (
  "id"                      TEXT NOT NULL,
  "userId"                  TEXT NOT NULL,
  "accountId"               TEXT NOT NULL,
  "maxDailyLoss"            DOUBLE PRECISION,
  "maxTradesPerDay"         INTEGER,
  "maxTradesCount"          INTEGER,
  "maxTradesWindowMin"      INTEGER,
  "maxConsecutiveLosses"    INTEGER,
  "cooldownAfterLossMin"    INTEGER,
  "noTradeAfterHour"        INTEGER,
  "noSizeIncreaseAfterLoss" BOOLEAN NOT NULL DEFAULT false,
  "payoutModeEnabled"       BOOLEAN NOT NULL DEFAULT false,
  "createdAt"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"               TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Guardrails_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Guardrails_accountId_key" ON "Guardrails"("accountId");
ALTER TABLE "Guardrails" ADD CONSTRAINT "Guardrails_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Guardrails" ADD CONSTRAINT "Guardrails_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "PropFirmAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- TradingSession: one per trading day per account
CREATE TABLE "TradingSession" (
  "id"                TEXT NOT NULL,
  "userId"            TEXT NOT NULL,
  "accountId"         TEXT NOT NULL,
  "date"              DATE NOT NULL,
  "status"            "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
  "safetyStatus"      "AccountSafetyStatus" NOT NULL DEFAULT 'SAFE',
  "tradesCount"       INTEGER NOT NULL DEFAULT 0,
  "dailyPnl"          DOUBLE PRECISION NOT NULL DEFAULT 0,
  "dailyLossUsed"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  "disciplineScore"   INTEGER,
  "payoutSafetyScore" INTEGER,
  "notes"             TEXT,
  "completedAt"       TIMESTAMP(3),
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TradingSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TradingSession_userId_accountId_date_key"
  ON "TradingSession"("userId", "accountId", "date");
ALTER TABLE "TradingSession" ADD CONSTRAINT "TradingSession_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TradingSession" ADD CONSTRAINT "TradingSession_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "PropFirmAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DisciplineEvent: discipline/risk event log per session
CREATE TABLE "DisciplineEvent" (
  "id"        TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "type"      "DisciplineEventType" NOT NULL,
  "severity"  "DisciplineSeverity" NOT NULL DEFAULT 'WARNING',
  "message"   TEXT NOT NULL,
  "data"      JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DisciplineEvent_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "DisciplineEvent" ADD CONSTRAINT "DisciplineEvent_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "TradingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DisciplineEvent" ADD CONSTRAINT "DisciplineEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
