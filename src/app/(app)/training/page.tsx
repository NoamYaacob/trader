import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { TrainingHistory } from "@/components/training/training-history";
import { getTrainableSetups, getTrainingSessions } from "@/features/training";
import { getLatestStrategy } from "@/features/strategy";
import { startTrainingSession } from "@/server/actions/training";

// Local wrapper — form action must return void, not a union type.
async function handleStart() {
  "use server";
  await startTrainingSession();
}

export default async function TrainingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId   = session.user.id;
  const strategy = await getLatestStrategy(userId);

  if (!strategy || strategy.status !== "ACTIVE") {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="Training" subtitle="not available yet" />
        <div className="flex-1 p-8 max-w-[800px] w-full mx-auto">
          <EmptyState
            title="No playbook yet."
            description="Complete your strategy intake and confirm your playbook before starting training."
            action={{ label: "Go to playbook", href: "/playbook" }}
          />
        </div>
      </div>
    );
  }

  const [setups, pastSessions] = await Promise.all([
    getTrainableSetups(userId),
    getTrainingSessions(userId),
  ]);
  const totalExamples = setups.reduce((sum, s) => sum + s.exampleCount, 0);

  const completedCount = pastSessions.filter((s) => s.status === "COMPLETED").length;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Training"
        subtitle={completedCount > 0 ? `${completedCount} session${completedCount !== 1 ? "s" : ""} completed` : (totalExamples > 0 ? `${totalExamples} example${totalExamples !== 1 ? "s" : ""}` : undefined)}
      />

      <div className="flex-1 p-8 max-w-[680px] w-full mx-auto">

        {setups.length === 0 ? (
          <EmptyState
            title="No setups with examples yet."
            description="Add annotated examples to your setups before starting a training session."
            action={{ label: "Go to setup library", href: "/setups" }}
          />
        ) : (
          <div className="flex flex-col gap-8">

            <div className="flex flex-col gap-6">
              {/* Setup list */}
              <div className="flex flex-col gap-1.5">
                {setups.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-4 py-3 rounded border border-border bg-[var(--bg-surface)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <p className="text-[13px] text-primary truncate">{s.name}</p>
                      {s.tags.length > 0 && (
                        <div className="flex gap-1 shrink-0">
                          {s.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono text-muted border border-border rounded px-1.5 py-0.5"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-muted font-mono tabular-nums shrink-0 ml-4">
                      {s.exampleCount}
                    </span>
                  </div>
                ))}
              </div>

              {/* Start */}
              <form action={handleStart}>
                <button
                  type="submit"
                  className="w-full py-4 rounded bg-accent text-[var(--bg-base)] font-semibold text-[15px] tracking-tight hover:opacity-90 transition-opacity"
                >
                  Begin · {totalExamples} example{totalExamples !== 1 ? "s" : ""}
                </button>
              </form>
            </div>

            {/* Past sessions */}
            <TrainingHistory sessions={pastSessions} />

          </div>
        )}
      </div>
    </div>
  );
}
