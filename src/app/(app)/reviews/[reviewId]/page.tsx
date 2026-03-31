import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { AdherenceFormView } from "@/components/reviews/adherence-form";
import { getTradeReview, getChecklistRules } from "@/features/reviews";

interface Props {
  params: Promise<{ reviewId: string }>;
}

export default async function ReviewChecklistPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { reviewId } = await params;
  const userId       = session.user.id;

  const review = await getTradeReview(reviewId, userId);
  if (!review) notFound();

  // Already completed — send to results.
  if (review.status === "COMPLETE") {
    redirect(`/reviews/${reviewId}/results`);
  }

  const rules = await getChecklistRules(review.playbookId);

  const subtitle = `${review.instrument} · ${review.direction} · ${review.tradeDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Rule checklist" subtitle={subtitle} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[680px] w-full mx-auto px-4 py-8">
          {rules.length === 0 ? (
            <EmptyState
              title="No checklist rules."
              description="Mark rules as 'In checklist' on your playbook page before logging a review."
              action={{ label: "Go to playbook", href: "/playbook" }}
            />
          ) : (
            <AdherenceFormView reviewId={reviewId} rules={rules} />
          )}
        </div>
      </div>
    </div>
  );
}
