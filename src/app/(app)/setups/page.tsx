import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { SetupCard } from "@/components/setup/setup-card";
import { getActivePlaybookId, getSetupSummaries } from "@/features/setup";
import { getLatestStrategy } from "@/features/strategy";

export default async function SetupsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId   = session.user.id;
  const strategy = await getLatestStrategy(userId);

  // No active strategy — send them to start.
  if (!strategy || strategy.status !== "ACTIVE") {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="Setup Library" subtitle="no playbook yet" />
        <div className="flex-1 p-8 max-w-[1060px] w-full mx-auto">
          <EmptyState
            title="No playbook yet."
            description="Complete your strategy intake and confirm your playbook before adding setups."
            action={{ label: "Go to playbook", href: "/playbook" }}
          />
        </div>
      </div>
    );
  }

  const playbookId = await getActivePlaybookId(userId);
  const setups     = playbookId ? await getSetupSummaries(playbookId, userId) : [];

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Setup Library"
        subtitle={setups.length > 0 ? `${setups.length} setup${setups.length !== 1 ? "s" : ""}` : undefined}
        actions={
          <Link href="/setups/new">
            <Button variant="primary" size="sm">+ Add setup</Button>
          </Link>
        }
      />

      <div className="flex-1 p-8 max-w-[1060px] w-full mx-auto">
        {setups.length === 0 ? (
          <EmptyState
            title="No setups yet."
            description="Name a setup, describe the entry and exit conditions, and upload annotated screenshots. Your library trains your eye for what to take — and what to skip."
            action={{ label: "Add first setup", href: "/setups/new" }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {setups.map((setup) => (
              <SetupCard key={setup.id} setup={setup} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
