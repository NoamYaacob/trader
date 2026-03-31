// Public API for the training feature.
export type {
  TrainingSessionRecord,
  ExampleForTraining,
  AttemptResult,
  AttemptSummary,
  SessionResults,
  SetupForTraining,
  TrainingSessionSummary,
} from "./types";
export {
  getTrainableSetups,
  getExamplesForTraining,
  getTrainingSession,
  getSessionAttempts,
  getAttemptSummaries,
  getTrainingSessions,
} from "./data/session";
export { buildSessionResults } from "./domain/scoring";
