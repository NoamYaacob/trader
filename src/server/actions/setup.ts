"use server";

import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { auth } from "@/lib/auth";
import { setupSchema, parseTags } from "@/features/setup/domain/validation";
import {
  getActivePlaybookId,
  createSetup   as dbCreateSetup,
  updateSetup   as dbUpdateSetup,
  deleteSetup   as dbDeleteSetup,
  createExample as dbCreateExample,
  deleteExample as dbDeleteExample,
  updateExampleNotes     as dbUpdateExampleNotes,
  saveExampleAnnotations as dbSaveAnnotations,
} from "@/features/setup/data/setup";
import type { AnnotationData } from "@/features/setup/types";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session.user.id;
}

// Saves an uploaded image.
// Production (BLOB_READ_WRITE_TOKEN set): uploads to Vercel Blob, returns https URL.
// Local dev (no token): writes to public/uploads/[userId]/, returns /uploads/... path.
async function saveUploadedFile(file: File, userId: string): Promise<string> {
  const ext    = extname(file.name).toLowerCase() || ".jpg";
  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const filename = `examples/${userId}/${crypto.randomUUID()}${ext}`;
    const blob = await put(filename, buffer, {
      access:      "public",
      contentType: file.type,
    });
    return blob.url;
  }

  // Local dev fallback — public/uploads/ directory.
  const dir      = join(process.cwd(), "public", "uploads", userId);
  await mkdir(dir, { recursive: true });
  const filename = `${crypto.randomUUID()}${ext}`;
  await writeFile(join(dir, filename), buffer);
  return `/uploads/${userId}/${filename}`;
}

// Deletes an uploaded image.
// Detects Vercel Blob URLs (https://) vs local paths (/uploads/...).
async function deleteUploadedFile(imageUrl: string): Promise<void> {
  try {
    if (imageUrl.startsWith("http")) {
      const { del } = await import("@vercel/blob");
      await del(imageUrl);
    } else {
      const { unlink } = await import("fs/promises");
      const relative = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
      await unlink(join(process.cwd(), "public", relative));
    }
  } catch {
    // File may already be deleted or not exist — not a fatal error.
  }
}

// ── Setup CRUD ─────────────────────────────────────────────────────────────

export async function createSetup(
  data: Record<string, string>
): Promise<{ success: false; error: string } | never> {
  const userId = await requireUserId();

  const parsed = setupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message ?? "Invalid input." };
  }

  const playbookId = await getActivePlaybookId(userId);
  if (!playbookId) {
    return { success: false, error: "You need a confirmed playbook before adding setups." };
  }

  const result = await dbCreateSetup(playbookId, userId, {
    name:                  parsed.data.name,
    description:           parsed.data.description           ?? "",
    entryCondition:        parsed.data.entryCondition        ?? "",
    exitCondition:         parsed.data.exitCondition         ?? "",
    invalidationCondition: parsed.data.invalidationCondition ?? "",
    tags:                  parseTags(parsed.data.tags),
  });

  if (!result.success) return result;
  redirect(`/setups/${result.id}`);
}

export async function updateSetup(
  setupId: string,
  data: Record<string, string>
): Promise<{ success: true } | { success: false; error: string }> {
  const userId = await requireUserId();

  const parsed = setupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message ?? "Invalid input." };
  }

  return dbUpdateSetup(setupId, userId, {
    name:                  parsed.data.name,
    description:           parsed.data.description           ?? "",
    entryCondition:        parsed.data.entryCondition        ?? "",
    exitCondition:         parsed.data.exitCondition         ?? "",
    invalidationCondition: parsed.data.invalidationCondition ?? "",
    tags:                  parseTags(parsed.data.tags),
  });
}

export async function deleteSetup(
  setupId: string
): Promise<{ success: false; error: string } | never> {
  const userId = await requireUserId();
  const result = await dbDeleteSetup(setupId, userId);
  if (!result.success) return result;

  // Clean up image files after DB deletion.
  await Promise.allSettled(result.imageUrls.map(deleteUploadedFile));

  redirect("/setups");
}

// ── Examples ───────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES      = 10 * 1024 * 1024; // 10 MB

export async function uploadExample(
  setupId: string,
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  const userId = await requireUserId();

  const file           = formData.get("image") as File | null;
  const classification = formData.get("classification") as string | null;
  const notes          = (formData.get("notes") as string | null) ?? "";

  if (!file || file.size === 0) return { success: false, error: "No image selected." };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: "Only JPEG, PNG, WebP, and GIF images are allowed." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { success: false, error: "Image must be under 10 MB." };
  }
  if (classification !== "VALID" && classification !== "INVALID") {
    return { success: false, error: "Classification must be VALID or INVALID." };
  }

  let imageUrl: string;
  try {
    imageUrl = await saveUploadedFile(file, userId);
  } catch {
    return { success: false, error: "Failed to save image. Please try again." };
  }

  const result = await dbCreateExample(setupId, userId, {
    imageUrl,
    classification,
    notes,
  });

  if (!result.success) {
    // If DB save fails, delete the uploaded file to avoid orphans.
    await deleteUploadedFile(imageUrl);
    return result;
  }

  return { success: true };
}

export async function deleteExample(
  exampleId: string,
  setupId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const userId = await requireUserId();
  const result = await dbDeleteExample(exampleId, setupId, userId);
  if (!result.success) return result;
  await deleteUploadedFile(result.imageUrl);
  return { success: true };
}

export async function updateExampleNotes(
  exampleId: string,
  setupId: string,
  notes: string
): Promise<{ success: true } | { success: false; error: string }> {
  const userId = await requireUserId();
  return dbUpdateExampleNotes(exampleId, setupId, userId, notes);
}

export async function saveExampleAnnotations(
  exampleId: string,
  setupId: string,
  annotations: AnnotationData
): Promise<{ success: true } | { success: false; error: string }> {
  const userId = await requireUserId();
  return dbSaveAnnotations(exampleId, setupId, userId, annotations);
}
