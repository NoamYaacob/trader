import { prisma } from "@/db/client";
import type {
  TrainingSessionRecord,
  ExampleForTraining,
  AttemptSummary,
  SetupForTraining,
} from "../types";
import type { AnnotationData } from "@/features/setup/types";

// ── Type mappers ───────────────────────────────────────────────────────────

function toSessionRecord(row: {
  id:           string;
  playbookId:   string;
  exampleOrder: string[];
  score:        number | null;
  totalCount:   number;
  correctCount: number;
  completedAt:  Date | null;
  createdAt:    Date;
}): TrainingSessionRecord {
  return {
    id:           row.id,
    playbookId:   row.playbookId,
    exampleOrder: row.exampleOrder,
    score:        row.score,
    totalCount:   row.totalCount,
    correctCount: row.correctCount,
    completedAt:  row.completedAt,
    createdAt:    row.createdAt,
  };
}

function parseAnnotations(json: unknown): AnnotationData {
  if (!json || typeof json !== "object") return { markers: [] };
  const obj = json as Record<string, unknown>;
  if (!Array.isArray(obj.markers)) return { markers: [] };
  return {
    markers: (obj.markers as Record<string, unknown>[])
      .filter((m) => typeof m.x === "number" && typeof m.y === "number")
      .map((m) => ({ x: m.x as number, y: m.y as number })),
  };
}

// ── Queries ────────────────────────────────────────────────────────────────

// Returns setups that have at least one example — eligible for training.
export async function getTrainableSetups(
  userId: string
): Promise<SetupForTraining[]> {
  const rows = await prisma.setup.findMany({
    where:   { userId, examples: { some: {} } },
    orderBy: { createdAt: "asc" },
    include: { examples: { select: { id: true } } },
  });

  return rows.map((row) => ({
    id:           row.id,
    name:         row.name,
    tags:         row.tags,
    exampleCount: row.examples.length,
  }));
}

// Loads examples in the order specified by exampleOrder.
// Classification is intentionally excluded from the return value.
export async function getExamplesForTraining(
  exampleIds: string[],
  userId: string
): Promise<ExampleForTraining[]> {
  const rows = await prisma.setupExample.findMany({
    where:   { id: { in: exampleIds }, setup: { userId } },
    include: {
      setup: {
        select: {
          id:                    true,
          name:                  true,
          tags:                  true,
          entryCondition:        true,
          exitCondition:         true,
          invalidationCondition: true,
        },
      },
    },
  });

  // Preserve the shuffled order from the session.
  const byId = new Map(rows.map((r) => [r.id, r]));
  return exampleIds
    .map((id) => byId.get(id))
    .filter((r): r is NonNullable<typeof r> => r !== undefined)
    .map((r) => ({
      id:                    r.id,
      imageUrl:              r.imageUrl,
      setupId:               r.setup.id,
      setupName:             r.setup.name,
      setupTags:             r.setup.tags,
      entryCondition:        r.setup.entryCondition,
      exitCondition:         r.setup.exitCondition,
      invalidationCondition: r.setup.invalidationCondition,
      annotationData:        parseAnnotations(r.annotationData),
    }));
}

// Loads an existing training session (verifies ownership).
export async function getTrainingSession(
  sessionId: string,
  userId: string
): Promise<TrainingSessionRecord | null> {
  const row = await prisma.trainingSession.findFirst({
    where: { id: sessionId, userId },
  });
  return row ? toSessionRecord(row) : null;
}

// Returns already-answered example IDs for a session (for resume support).
export async function getSessionAttempts(
  sessionId: string
): Promise<Map<string, { userAnswer: "VALID" | "INVALID"; isCorrect: boolean }>> {
  const rows = await prisma.trainingAttempt.findMany({
    where: { sessionId },
  });
  const map = new Map<string, { userAnswer: "VALID" | "INVALID"; isCorrect: boolean }>();
  for (const row of rows) {
    map.set(row.exampleId, {
      userAnswer: row.userAnswer as "VALID" | "INVALID",
      isCorrect:  row.isCorrect,
    });
  }
  return map;
}

// Returns all attempt summaries for the results page.
export async function getAttemptSummaries(
  sessionId: string,
  userId: string
): Promise<AttemptSummary[]> {
  const rows = await prisma.trainingAttempt.findMany({
    where:   { sessionId, session: { userId } },
    orderBy: { answeredAt: "asc" },
    include: {
      example: {
        select: {
          imageUrl:       true,
          classification: true,
          setup:          { select: { name: true } },
        },
      },
    },
  });

  return rows.map((row) => ({
    exampleId:            row.exampleId,
    imageUrl:             row.example.imageUrl,
    setupName:            row.example.setup.name,
    userAnswer:           row.userAnswer as "VALID" | "INVALID",
    actualClassification: row.example.classification as "VALID" | "INVALID",
    isCorrect:            row.isCorrect,
  }));
}

// ── Mutations ──────────────────────────────────────────────────────────────

// Creates a new training session with the given shuffled example order.
export async function createTrainingSession(
  userId: string,
  playbookId: string,
  exampleOrder: string[]
): Promise<TrainingSessionRecord> {
  const row = await prisma.trainingSession.create({
    data: { userId, playbookId, exampleOrder },
  });
  return toSessionRecord(row);
}

// Records one answer. Returns the actual classification and correctness.
export async function recordAttempt(
  sessionId: string,
  userId: string,
  exampleId: string,
  userAnswer: "VALID" | "INVALID"
): Promise<{ isCorrect: boolean; actualClassification: "VALID" | "INVALID"; exampleNotes: string | null } | { error: string }> {
  // Verify ownership and get the actual classification.
  const example = await prisma.setupExample.findFirst({
    where:  { id: exampleId, setup: { userId } },
    select: { classification: true, notes: true },
  });
  if (!example) return { error: "Example not found." };

  const actual    = example.classification as "VALID" | "INVALID";
  const isCorrect = userAnswer === actual;

  // Create attempt and increment session counters atomically.
  await prisma.$transaction([
    prisma.trainingAttempt.create({
      data: { sessionId, exampleId, userAnswer, isCorrect },
    }),
    prisma.trainingSession.update({
      where: { id: sessionId },
      data: {
        totalCount:   { increment: 1 },
        correctCount: { increment: isCorrect ? 1 : 0 },
      },
    }),
  ]);

  return { isCorrect, actualClassification: actual, exampleNotes: example.notes };
}

// Marks the session complete and calculates the final score.
export async function completeTrainingSession(
  sessionId: string,
  userId: string
): Promise<{ score: number } | { error: string }> {
  const session = await prisma.trainingSession.findFirst({
    where:  { id: sessionId, userId },
    select: { totalCount: true, correctCount: true },
  });
  if (!session) return { error: "Session not found." };

  const score = session.totalCount > 0
    ? Math.round((session.correctCount / session.totalCount) * 100)
    : 0;

  await prisma.trainingSession.update({
    where: { id: sessionId },
    data:  { completedAt: new Date(), score },
  });

  return { score };
}
