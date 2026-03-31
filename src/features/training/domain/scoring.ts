import type { AttemptSummary, SessionResults, TrainingSessionRecord } from "../types";

// Builds a complete SessionResults object from raw attempt data.
export function buildSessionResults(
  session: TrainingSessionRecord,
  attempts: AttemptSummary[]
): SessionResults {
  // Valid accuracy: how often did the user correctly identify VALID examples.
  const validExamples   = attempts.filter((a) => a.actualClassification === "VALID");
  const invalidExamples = attempts.filter((a) => a.actualClassification === "INVALID");

  const validAccuracy   = validExamples.length > 0
    ? Math.round((validExamples.filter((a) => a.isCorrect).length / validExamples.length) * 100)
    : -1;

  const invalidAccuracy = invalidExamples.length > 0
    ? Math.round((invalidExamples.filter((a) => a.isCorrect).length / invalidExamples.length) * 100)
    : -1;

  // Per-setup accuracy: group attempts by setup name.
  const setupMap = new Map<string, { correct: number; total: number }>();
  for (const attempt of attempts) {
    const existing = setupMap.get(attempt.setupName) ?? { correct: 0, total: 0 };
    setupMap.set(attempt.setupName, {
      correct: existing.correct + (attempt.isCorrect ? 1 : 0),
      total:   existing.total + 1,
    });
  }
  const bySetup = Array.from(setupMap.entries()).map(([setupName, counts]) => ({
    setupName,
    ...counts,
  }));

  return { session, attempts, validAccuracy, invalidAccuracy, bySetup };
}
