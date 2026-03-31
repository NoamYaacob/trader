"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActivePlaybookId } from "@/features/setup/data/setup";
import {
  createTradeReview,
  getChecklistRules,
  completeTradeReview,
  getTradeReview,
} from "@/features/reviews/data/review";
import type { TradeFormInput, RuleAdherenceInput } from "@/features/reviews/types";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session.user.id;
}

// Creates a DRAFT TradeReview from the trade details form and redirects
// to the adherence checklist page.
export async function startReview(
  input: TradeFormInput
): Promise<{ success: false; error: string } | never> {
  const userId = await requireUserId();

  if (!input.instrument.trim()) {
    return { success: false, error: "Instrument is required." };
  }
  if (!input.tradeDate) {
    return { success: false, error: "Trade date is required." };
  }

  const playbookId = await getActivePlaybookId(userId);
  if (!playbookId) {
    return { success: false, error: "You need a confirmed playbook to log a trade review." };
  }

  const review = await createTradeReview(userId, playbookId, input);
  redirect(`/reviews/${review.id}`);
}

// Saves all rule adherence marks, scores the review, and redirects to results.
export async function submitAdherence(
  reviewId: string,
  inputs: RuleAdherenceInput[]
): Promise<{ success: false; error: string } | never> {
  const userId = await requireUserId();

  // Verify ownership.
  const review = await getTradeReview(reviewId, userId);
  if (!review) {
    return { success: false, error: "Review not found." };
  }
  if (review.status === "COMPLETE") {
    redirect(`/reviews/${reviewId}/results`);
  }

  // Load current checklist rules for text/category snapshots.
  const checklistRules = await getChecklistRules(review.playbookId);
  if (checklistRules.length === 0) {
    return { success: false, error: "No checklist rules found. Confirm your playbook first." };
  }

  const result = await completeTradeReview(reviewId, userId, inputs, checklistRules);
  if ("error" in result) return { success: false, error: result.error };

  redirect(`/reviews/${reviewId}/results`);
}
