import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { ExampleSection } from "@/components/setup/example-section";
import { getSetupWithExamples } from "@/features/setup";
import { deleteSetup } from "@/server/actions/setup";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SetupDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { id }   = await params;
  const userId   = session.user.id;
  const setup    = await getSetupWithExamples(id, userId);

  if (!setup) notFound();

  const totalExamples = setup.examples.length;
  const subtitle      = totalExamples > 0
    ? `${setup.examples.filter((e) => e.classification === "VALID").length} valid · ${setup.examples.filter((e) => e.classification === "INVALID").length} invalid`
    : "no examples yet";

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title={setup.name}
        subtitle={subtitle}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/setups/${setup.id}/edit`}>
              <Button variant="secondary" size="sm">Edit setup</Button>
            </Link>
            <form
              action={async () => {
                "use server";
                await deleteSetup(id);
              }}
            >
              <Button variant="ghost" size="sm" type="submit">
                Delete
              </Button>
            </form>
          </div>
        }
      />

      <div className="flex-1 p-8 max-w-[900px] w-full mx-auto space-y-8">

        {/* Tags */}
        {setup.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {setup.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono text-accent/80 border border-accent/20 bg-accent/5 rounded px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Setup description fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {setup.entryCondition && (
            <div className="card-surface p-4">
              <p className="label-section mb-2">Entry</p>
              <p className="text-[12px] text-secondary leading-relaxed font-mono">
                {setup.entryCondition}
              </p>
            </div>
          )}
          {setup.exitCondition && (
            <div className="card-surface p-4">
              <p className="label-section mb-2">Exit</p>
              <p className="text-[12px] text-secondary leading-relaxed font-mono">
                {setup.exitCondition}
              </p>
            </div>
          )}
          {setup.invalidationCondition && (
            <div className="card-surface p-4">
              <p className="label-section mb-2">Invalidation</p>
              <p className="text-[12px] text-secondary leading-relaxed font-mono">
                {setup.invalidationCondition}
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        {setup.description && (
          <div>
            <p className="label-section mb-2">Description</p>
            <p className="text-[13px] text-secondary leading-relaxed">
              {setup.description}
            </p>
          </div>
        )}

        {/* Examples */}
        <div>
          <p className="label-section mb-4">Examples</p>
          <ExampleSection setupId={setup.id} initialExamples={setup.examples} />
        </div>

      </div>
    </div>
  );
}
