import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { TradeFormView } from "@/components/reviews/trade-form";
import { getLatestStrategy } from "@/features/strategy";
import { getLatestPlaybook } from "@/features/playbook/data/playbook";
import { prisma } from "@/db/client";

export default async function NewReviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId   = session.user.id;
  const strategy = await getLatestStrategy(userId);

  if (!strategy || strategy.status !== "ACTIVE") {
    redirect("/reviews");
  }

  const playbook = await getLatestPlaybook(strategy.id, userId);
  if (!playbook || playbook.status !== "CONFIRMED") {
    redirect("/reviews");
  }

  // Load the user's setups for the optional setup selector.
  const setups = await prisma.setup.findMany({
    where:   { userId },
    orderBy: { name: "asc" },
    select:  { id: true, name: true },
  });

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="New review" subtitle="trade details" />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[560px] w-full mx-auto px-4 py-8">
          <TradeFormView setups={setups} />
        </div>
      </div>
    </div>
  );
}
