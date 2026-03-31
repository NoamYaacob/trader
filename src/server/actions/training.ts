"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/db/client";
import {
  createTrainingSession,
  recordAttempt as dbRecordAttempt,
  completeTrainingSession,
} from "@/features/training/data/session";
import { getActivePlaybookId } from "@/features/setup/data/setup";
import type { AttemptResult } from "@/features/training/types";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session.user.id;
}

// Fisher-Yates shuffle — produces a new shuffled array without mutation.
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Creates a new training session from all eligible examples across all user setups,
// then redirects to the session page.
export async function startTrainingSession(): Promise<
  { success: false; error: string } | never
> {
  const userId = await requireUserId();

  const playbookId = await getActivePlaybookId(userId);
  if (!playbookId) {
    return { success: false, error: "You need an active playbook to start training." };
  }

  // Collect all SetupExample IDs for the user's setups.
  const examples = await prisma.setupExample.findMany({
    where:  { setup: { userId } },
    select: { id: true },
  });

  if (examples.length === 0) {
    return { success: false, error: "Add at least one example to a setup before training." };
  }

  const exampleOrder = shuffle(examples.map((e) => e.id));
  const session      = await createTrainingSession(userId, playbookId, exampleOrder);

  redirect(`/training/${session.id}`);
}

// Records one answer and returns the result (actual classification + correctness).
// This is called by the client component after each VALID/INVALID click.
export async function recordAttempt(
  sessionId: string,
  exampleId: string,
  userAnswer: "VALID" | "INVALID"
): Promise<AttemptResult | { success: false; error: string }> {
  const userId = await requireUserId();

  // Verify the session belongs to this user.
  const session = await prisma.trainingSession.findFirst({
    where:  { id: sessionId, userId, completedAt: null },
    select: { id: true },
  });
  if (!session) return { success: false, error: "Session not found or already completed." };

  // Guard against duplicate answers (page refresh).
  const existing = await prisma.trainingAttempt.findFirst({
    where:  { sessionId, exampleId },
    select: { id: true, isCorrect: true },
  });
  if (existing) return { success: false, error: "Already answered." };

  const result = await dbRecordAttempt(sessionId, userId, exampleId, userAnswer);
  if ("error" in result) return { success: false, error: result.error };

  return result;
}

// Marks the session complete and redirects to the results page.
export async function completeSession(
  sessionId: string
): Promise<{ success: false; error: string } | never> {
  const userId = await requireUserId();

  const result = await completeTrainingSession(sessionId, userId);
  if ("error" in result) return { success: false, error: result.error };

  redirect(`/training/${sessionId}/results`);
}
