import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { ReviewSummaryView } from "@/components/reviews/review-summary";
import {
  getTradeReview,
  getReviewAdherence,
  buildReviewResults,
} from "@/features/reviews";
import { startReview } from "@/server/actions/reviews";
import type { TradeFormInput } from "@/features/reviews/types";

// Starts a fresh review for the same instrument/direction as a quick "review again" action.
async function handleNewReview(
  instrument: string,
  direction:  "LONG" | "SHORT"
): Promise<void> {
  "use server";
  const today = new Date().toISOString().split("T")[0];
  await startReview({
    instrument,
    direction,
    tradeDate: today,
    setupId:   null,
    notes:     null,
  } satisfies TradeFormInput);
}

interface Props {
  params: Promise<{ reviewId: string }>;
}

export default async function ReviewResultsPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { reviewId } = await params;
  const userId       = session.user.id;

  const review = await getTradeReview(reviewId, userId);
  if (!review) notFound();

  if (review.status !== "COMPLETE") {
    redirect(`/reviews/${reviewId}`);
  }

  const adherence = await getReviewAdherence(reviewId);
  const results   = buildReviewResults(review, adherence);

  const scoreLabel = `${results.adherenceScore}% adherence`;

  // Bind instrument+direction into the server action for the "New review" shortcut.
  const instrument = review.instrument;
  const direction  = review.direction;

  async function newReviewAction(): Promise<void> {
    "use server";
    await handleNewReview(instrument, direction);
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Review results" subtitle={scoreLabel} />
      <div className="flex-1 overflow-y-auto">
        <ReviewSummaryView results={results} newReviewAction={newReviewAction} />
      </div>
    </div>
  );
}
