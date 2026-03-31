import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { PlaybookReview } from "@/components/playbook/playbook-review";
import { getPlaybookById } from "@/features/playbook/data/playbook";

interface Props {
  params: Promise<{ playbookId: string }>;
}

export default async function ArchivedPlaybookPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { playbookId } = await params;
  const userId         = session.user.id;

  const playbook = await getPlaybookById(playbookId, userId);
  if (!playbook) notFound();

  // Only archived playbooks are accessible via this route.
  // DRAFT and CONFIRMED versions are managed through /playbook.
  if (playbook.status !== "ARCHIVED") {
    redirect("/playbook");
  }

  const subtitle = `v${playbook.version} · ${playbook.rules.length} rules · archived`;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Archived playbook" subtitle={subtitle} />
      <div className="flex-1 overflow-y-auto">
        <PlaybookReview playbook={playbook} archived={true} />
      </div>
    </div>
  );
}
