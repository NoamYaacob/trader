import { prisma } from "@/db/client";
import type { StrategyRecord, StrategyIntakeData } from "../types";

// Map a Prisma Strategy row to the domain StrategyRecord type.
// The UI layer never imports Prisma types directly.
function toStrategyRecord(row: {
  id:                    string;
  intakeStep:            number;
  status:                string;
  instrument:            string | null;
  timeframe:             string | null;
  overview:              string | null;
  entryConditions:       string | null;
  exitConditions:        string | null;
  invalidationConditions:string | null;
  riskRules:             string | null;
  whatMakesValid:        string | null;
  whatMakesInvalid:      string | null;
  createdAt:             Date;
  updatedAt:             Date;
}): StrategyRecord {
  return {
    id:         row.id,
    intakeStep: row.intakeStep,
    status:     row.status as StrategyRecord["status"],
    intake: {
      instrument:             row.instrument             ?? "",
      timeframe:              row.timeframe              ?? "",
      overview:               row.overview               ?? "",
      entryConditions:        row.entryConditions        ?? "",
      exitConditions:         row.exitConditions         ?? "",
      invalidationConditions: row.invalidationConditions ?? "",
      riskRules:              row.riskRules              ?? "",
      whatMakesValid:         row.whatMakesValid         ?? "",
      whatMakesInvalid:       row.whatMakesInvalid       ?? "",
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getDraftStrategy(
  userId: string
): Promise<StrategyRecord | null> {
  const row = await prisma.strategy.findFirst({
    where: { userId, status: "DRAFT" },
    orderBy: { createdAt: "desc" },
  });
  return row ? toStrategyRecord(row) : null;
}

export async function createDraftStrategy(
  userId: string
): Promise<StrategyRecord> {
  const row = await prisma.strategy.create({
    data: { userId },
  });
  return toStrategyRecord(row);
}

export async function updateStrategyStep(
  strategyId: string,
  userId: string,
  step: number,
  data: Partial<StrategyIntakeData>
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await prisma.strategy.updateMany({
      where: { id: strategyId, userId },
      data: { ...data, intakeStep: step },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save. Please try again." };
  }
}

export async function submitStrategy(
  strategyId: string,
  userId: string,
  finalStepData: Partial<StrategyIntakeData>
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await prisma.strategy.updateMany({
      where: { id: strategyId, userId },
      data: {
        ...finalStepData,
        intakeStep: 7,
        status: "SUBMITTED",
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to submit strategy. Please try again." };
  }
}
