import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { SetupForm } from "@/components/setup/setup-form";
import { getSetupWithExamples } from "@/features/setup";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSetupPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { id }  = await params;
  const userId  = session.user.id;
  const setup   = await getSetupWithExamples(id, userId);

  if (!setup) notFound();

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title={`Edit: ${setup.name}`} />
      <div className="flex-1 p-8 max-w-[800px] w-full mx-auto">
        <SetupForm setup={setup} />
      </div>
    </div>
  );
}
