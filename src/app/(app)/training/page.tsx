import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { getTrainableSetups } from "@/features/training";
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

  const setups = await getTrainableSetups(userId);
  const totalExamples = setups.reduce((sum, s) => sum + s.exampleCount, 0);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Training" subtitle={totalExamples > 0 ? `${totalExamples} example${totalExamples !== 1 ? "s" : ""} available` : undefined} />

      <div className="flex-1 p-8 max-w-[680px] w-full mx-auto">

        {setups.length === 0 ? (
          <EmptyState
            title="No setups with examples yet."
            description="Add annotated examples to your setups before starting a training session."
            action={{ label: "Go to setup library", href: "/setups" }}
          />
        ) : (
          <div className="flex flex-col gap-8">

            {/* Intro */}
            <div>
              <h2 className="text-[17px] font-semibold text-primary tracking-tight mb-2">
                Setup recognition drill
              </h2>
              <p className="text-[13px] text-secondary leading-relaxed">
                You&apos;ll be shown example images from your setup library — without labels.
                Decide: valid setup or not? Each answer is scored against your actual classifications.
                Your notes are revealed after each answer.
              </p>
            </div>

            {/* Setup list */}
            <div>
              <p className="label-section mb-3">Setups in this session</p>
              <div className="flex flex-col gap-2">
                {setups.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-4 py-3 card-surface"
                  >
                    <div className="flex items-center gap-3">
                      <p className="text-[13px] text-primary">{s.name}</p>
                      {s.tags.length > 0 && (
                        <div className="flex gap-1">
                          {s.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono text-accent/70 border border-accent/20 bg-accent/5 rounded px-1.5 py-0.5"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-muted font-mono shrink-0">
                      {s.exampleCount} example{s.exampleCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Start */}
            <form action={handleStart}>
              <button
                type="submit"
                className="w-full py-4 rounded border border-accent/40 bg-accent/10 text-accent font-semibold text-[15px] tracking-tight hover:bg-accent/20 hover:border-accent/60 transition-all"
              >
                Begin session · {totalExamples} question{totalExamples !== 1 ? "s" : ""}
              </button>
            </form>

          </div>
        )}
      </div>
    </div>
  );
}
