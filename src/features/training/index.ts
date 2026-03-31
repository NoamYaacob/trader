// Public API for the training feature.
export type {
  TrainingSessionRecord,
  ExampleForTraining,
  AttemptResult,
  AttemptSummary,
  SessionResults,
  SetupForTraining,
} from "./types";
export {
  getTrainableSetups,
  getExamplesForTraining,
  getTrainingSession,
  getSessionAttempts,
  getAttemptSummaries,
} from "./data/session";
export { buildSessionResults } from "./domain/scoring";
