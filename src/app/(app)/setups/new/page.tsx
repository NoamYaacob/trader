import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { SetupForm } from "@/components/setup/setup-form";
import { getLatestStrategy } from "@/features/strategy";
import { getActivePlaybookId } from "@/features/setup";

export default async function NewSetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId   = session.user.id;
  const strategy = await getLatestStrategy(userId);

  if (!strategy || strategy.status !== "ACTIVE") {
    redirect("/playbook");
  }

  const playbookId = await getActivePlaybookId(userId);
  if (!playbookId) redirect("/playbook");

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="New Setup" />
      <div className="flex-1 p-8 max-w-[800px] w-full mx-auto">
        <SetupForm />
      </div>
    </div>
  );
}
