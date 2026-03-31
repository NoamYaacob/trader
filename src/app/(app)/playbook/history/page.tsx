import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { PlaybookHistory } from "@/components/playbook/playbook-history";
import { getLatestStrategy } from "@/features/strategy";
import { getAllPlaybookVersions } from "@/features/playbook/data/playbook";

export default async function PlaybookHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId   = session.user.id;
  const strategy = await getLatestStrategy(userId);

  if (!strategy || strategy.status === "DRAFT") {
    redirect("/playbook");
  }

  const versions = await getAllPlaybookVersions(strategy.id, userId);

  const archivedCount = versions.filter((v) => v.status === "ARCHIVED").length;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Version history"
        subtitle={archivedCount > 0 ? `${archivedCount} archived` : undefined}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[680px] w-full mx-auto px-4 py-8 flex flex-col gap-6">

          <div className="flex items-center justify-between">
            <p className="text-[13px] text-secondary">
              {versions.length} version{versions.length !== 1 ? "s" : ""} · archived versions are read-only
            </p>
            <a
              href="/playbook"
              className="text-[12px] text-muted hover:text-secondary transition-colors font-mono"
            >
              ← Current version
            </a>
          </div>

          <PlaybookHistory versions={versions} />

        </div>
      </div>
    </div>
  );
}
