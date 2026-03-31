// Types scoped to the Training feature.

export type SessionStatus = "IN_PROGRESS" | "COMPLETED";

export interface TrainingSessionRecord {
  id:           string;
  playbookId:   string;
  exampleOrder: string[]; // SetupExample IDs in presentation order
  score:        number | null;
  totalCount:   number;
  correctCount: number;
  completedAt:  Date | null;
  createdAt:    Date;
}

// Example data sent to the client during training.
// Classification is intentionally absent — it must not be sent until after the user answers.
export interface ExampleForTraining {
  id:                    string;
  imageUrl:              string;
  setupId:               string;
  setupName:             string;
  setupTags:             string[];
  entryCondition:        string | null;
  exitCondition:         string | null;
  invalidationCondition: string | null;
  annotationData:        { markers: { x: number; y: number }[] };
}

// Returned by recordAttempt — reveals the answer and provides feedback.
export interface AttemptResult {
  isCorrect:            boolean;
  actualClassification: "VALID" | "INVALID";
  exampleNotes:         string | null;
}

// A completed attempt as shown on the results screen.
export interface AttemptSummary {
  exampleId:            string;
  imageUrl:             string;
  setupName:            string;
  userAnswer:           "VALID" | "INVALID";
  actualClassification: "VALID" | "INVALID";
  isCorrect:            boolean;
}

export interface SessionResults {
  session:         TrainingSessionRecord;
  attempts:        AttemptSummary[];
  validAccuracy:   number; // 0–100, or -1 if no VALID examples
  invalidAccuracy: number; // 0–100, or -1 if no INVALID examples
  bySetup:         { setupName: string; correct: number; total: number }[];
}

// Lightweight info shown on the training landing page.
export interface SetupForTraining {
  id:           string;
  name:         string;
  tags:         string[];
  exampleCount: number;
}

// Compact summary shown in the training history list.
export interface TrainingSessionSummary {
  id:              string;
  score:           number | null;
  totalCount:      number;
  correctCount:    number;
  status:          "IN_PROGRESS" | "COMPLETED";
  playbookVersion: number | null;
  createdAt:       Date;
  completedAt:     Date | null;
}
