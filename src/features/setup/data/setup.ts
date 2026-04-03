import { prisma } from "@/db/client";
import type {
  SetupRecord,
  SetupSummary,
  SetupExampleRecord,
  AnnotationData,
} from "../types";

// ── Annotation JSON ────────────────────────────────────────────────────────

function parseAnnotationData(json: unknown): AnnotationData {
  if (!json || typeof json !== "object") return { markers: [] };
  const obj = json as Record<string, unknown>;
  if (!Array.isArray(obj.markers)) return { markers: [] };
  return {
    markers: obj.markers
      .filter(
        (m): m is Record<string, unknown> =>
          typeof m === "object" && m !== null
      )
      .map((m) => ({
        x: typeof m.x === "number" ? m.x : 0,
        y: typeof m.y === "number" ? m.y : 0,
      })),
  };
}

// Rewrites a Vercel Blob private-store URL to the local proxy path so that
// <img src> can load it without needing an Authorization header.
// Local /uploads/ paths and already-proxied paths are returned unchanged.
function resolveImageUrl(raw: string): string {
  if (raw.includes(".blob.vercel-storage.com")) {
    return `/api/blob?url=${encodeURIComponent(raw)}`;
  }
  return raw;
}

// ── Type mappers ───────────────────────────────────────────────────────────

function toExampleRecord(row: {
  id:             string;
  setupId:        string;
  imageUrl:       string;
  classification: string;
  notes:          string | null;
  annotationData: unknown;
  createdAt:      Date;
}): SetupExampleRecord {
  return {
    id:             row.id,
    setupId:        row.setupId,
    imageUrl:       resolveImageUrl(row.imageUrl),
    classification: row.classification as SetupExampleRecord["classification"],
    notes:          row.notes,
    annotations:    parseAnnotationData(row.annotationData),
    createdAt:      row.createdAt,
  };
}

function toSetupRecord(row: {
  id:                    string;
  playbookId:            string;
  name:                  string;
  description:           string | null;
  entryCondition:        string | null;
  exitCondition:         string | null;
  invalidationCondition: string | null;
  tags:                  string[];
  createdAt:             Date;
  updatedAt:             Date;
  examples: {
    id:             string;
    setupId:        string;
    imageUrl:       string;
    classification: string;
    notes:          string | null;
    annotationData: unknown;
    createdAt:      Date;
  }[];
}): SetupRecord {
  return {
    id:                    row.id,
    playbookId:            row.playbookId,
    name:                  row.name,
    description:           row.description,
    entryCondition:        row.entryCondition,
    exitCondition:         row.exitCondition,
    invalidationCondition: row.invalidationCondition,
    tags:                  row.tags,
    examples:              row.examples.map(toExampleRecord),
    createdAt:             row.createdAt,
    updatedAt:             row.updatedAt,
  };
}

// ── Queries ────────────────────────────────────────────────────────────────

// Returns the active playbook id for a user (latest non-archived).
export async function getActivePlaybookId(userId: string): Promise<string | null> {
  const playbook = await prisma.playbook.findFirst({
    where:   { userId, status: { not: "ARCHIVED" } },
    orderBy: { version: "desc" },
    select:  { id: true },
  });
  return playbook?.id ?? null;
}

// Lightweight list for the library page.
export async function getSetupSummaries(
  playbookId: string,
  userId: string
): Promise<SetupSummary[]> {
  const rows = await prisma.setup.findMany({
    where:   { playbookId, userId },
    orderBy: { createdAt: "asc" },
    include: {
      examples: { select: { classification: true } },
    },
  });

  return rows.map((row) => ({
    id:           row.id,
    name:         row.name,
    description:  row.description,
    tags:         row.tags,
    validCount:   row.examples.filter((e) => e.classification === "VALID").length,
    invalidCount: row.examples.filter((e) => e.classification === "INVALID").length,
    createdAt:    row.createdAt,
  }));
}

// Full setup with examples for the detail page.
export async function getSetupWithExamples(
  setupId: string,
  userId: string
): Promise<SetupRecord | null> {
  const row = await prisma.setup.findFirst({
    where:   { id: setupId, userId },
    include: {
      examples: { orderBy: { createdAt: "asc" } },
    },
  });
  return row ? toSetupRecord(row) : null;
}

// ── Mutations ──────────────────────────────────────────────────────────────

export async function createSetup(
  playbookId: string,
  userId: string,
  data: {
    name:                  string;
    description:           string;
    entryCondition:        string;
    exitCondition:         string;
    invalidationCondition: string;
    tags:                  string[];
  }
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const setup = await prisma.setup.create({
      data: {
        playbookId,
        userId,
        name:                  data.name,
        description:           data.description   || null,
        entryCondition:        data.entryCondition || null,
        exitCondition:         data.exitCondition  || null,
        invalidationCondition: data.invalidationCondition || null,
        tags:                  data.tags,
      },
      select: { id: true },
    });
    return { success: true, id: setup.id };
  } catch {
    return { success: false, error: "Failed to create setup." };
  }
}

export async function updateSetup(
  setupId: string,
  userId: string,
  data: {
    name:                  string;
    description:           string;
    entryCondition:        string;
    exitCondition:         string;
    invalidationCondition: string;
    tags:                  string[];
  }
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const count = await prisma.setup.updateMany({
      where: { id: setupId, userId },
      data: {
        name:                  data.name,
        description:           data.description   || null,
        entryCondition:        data.entryCondition || null,
        exitCondition:         data.exitCondition  || null,
        invalidationCondition: data.invalidationCondition || null,
        tags:                  data.tags,
      },
    });
    if (count.count === 0) return { success: false, error: "Setup not found." };
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update setup." };
  }
}

export async function deleteSetup(
  setupId: string,
  userId: string
): Promise<{ success: true; imageUrls: string[] } | { success: false; error: string }> {
  try {
    // Collect image URLs so the caller can clean up files.
    const examples = await prisma.setupExample.findMany({
      where:  { setup: { id: setupId, userId } },
      select: { imageUrl: true },
    });
    await prisma.setup.deleteMany({ where: { id: setupId, userId } });
    return { success: true, imageUrls: examples.map((e) => e.imageUrl) };
  } catch {
    return { success: false, error: "Failed to delete setup." };
  }
}

export async function createExample(
  setupId: string,
  userId: string,
  data: {
    imageUrl:       string;
    classification: "VALID" | "INVALID";
    notes:          string;
  }
): Promise<{ success: true; example: SetupExampleRecord } | { success: false; error: string }> {
  try {
    // Verify ownership.
    const setup = await prisma.setup.findFirst({
      where: { id: setupId, userId },
      select: { id: true },
    });
    if (!setup) return { success: false, error: "Setup not found." };

    const row = await prisma.setupExample.create({
      data: {
        setupId,
        imageUrl:       data.imageUrl,
        classification: data.classification,
        notes:          data.notes || null,
        annotationData: { markers: [] },
      },
    });
    return { success: true, example: toExampleRecord(row) };
  } catch {
    return { success: false, error: "Failed to save example." };
  }
}

export async function deleteExample(
  exampleId: string,
  setupId: string,
  userId: string
): Promise<{ success: true; imageUrl: string } | { success: false; error: string }> {
  try {
    const row = await prisma.setupExample.findFirst({
      where: { id: exampleId, setupId, setup: { userId } },
      select: { id: true, imageUrl: true },
    });
    if (!row) return { success: false, error: "Example not found." };

    await prisma.setupExample.delete({ where: { id: exampleId } });
    return { success: true, imageUrl: row.imageUrl };
  } catch {
    return { success: false, error: "Failed to delete example." };
  }
}

export async function updateExampleNotes(
  exampleId: string,
  setupId: string,
  userId: string,
  notes: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const row = await prisma.setupExample.findFirst({
      where: { id: exampleId, setupId, setup: { userId } },
      select: { id: true },
    });
    if (!row) return { success: false, error: "Example not found." };

    await prisma.setupExample.update({
      where: { id: exampleId },
      data:  { notes: notes || null },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update notes." };
  }
}

export async function saveExampleAnnotations(
  exampleId: string,
  setupId: string,
  userId: string,
  annotations: AnnotationData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const row = await prisma.setupExample.findFirst({
      where: { id: exampleId, setupId, setup: { userId } },
      select: { id: true },
    });
    if (!row) return { success: false, error: "Example not found." };

    await prisma.setupExample.update({
      where: { id: exampleId },
      data:  { annotationData: annotations as object },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save annotations." };
  }
}

// Returns the count of setups for a user across their active playbook.
export async function getSetupCount(userId: string): Promise<number> {
  return prisma.setup.count({ where: { userId } });
}
