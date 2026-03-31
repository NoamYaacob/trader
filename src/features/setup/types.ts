// Types scoped to the Setup feature.
// The UI layer imports from this file, never directly from Prisma.

export type ExampleClassification = "VALID" | "INVALID";

// A single annotation marker placed on an example image.
// Coordinates are percentages (0–100) relative to the image dimensions.
export interface Annotation {
  x: number;
  y: number;
}

export interface AnnotationData {
  markers: Annotation[];
}

export interface SetupExampleRecord {
  id:             string;
  setupId:        string;
  imageUrl:       string;
  classification: ExampleClassification;
  notes:          string | null;
  annotations:    AnnotationData;
  createdAt:      Date;
}

// Full record returned from the detail view (includes examples).
export interface SetupRecord {
  id:                    string;
  playbookId:            string;
  name:                  string;
  description:           string | null;
  entryCondition:        string | null;
  exitCondition:         string | null;
  invalidationCondition: string | null;
  tags:                  string[];
  examples:              SetupExampleRecord[];
  createdAt:             Date;
  updatedAt:             Date;
}

// Lightweight version used in the library list (no examples loaded).
export interface SetupSummary {
  id:           string;
  name:         string;
  description:  string | null;
  tags:         string[];
  validCount:   number;
  invalidCount: number;
  createdAt:    Date;
}

export interface SetupFormData {
  name:                  string;
  description:           string;
  entryCondition:        string;
  exitCondition:         string;
  invalidationCondition: string;
  tags:                  string; // comma-separated; parsed to string[] on save
}
