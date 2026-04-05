import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { getAllTemplates, getActiveAccount } from "@/features/prop-guard/data/prop-guard";
import { savePropFirmAccount } from "@/server/actions/prop-guard";
import { FirmSetupForm } from "@/components/prop-guard/firm-setup-form";

export default async function FirmSetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [templates, existing] = await Promise.all([
    getAllTemplates(),
    getActiveAccount(session.user.id),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Prop Firm Setup" subtitle="step 2 of 3" />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[560px] mx-auto px-4 py-8 flex flex-col gap-8">

          <div>
            <h2 className="text-[15px] font-semibold text-primary">Set up your prop firm account</h2>
            <p className="text-[13px] text-secondary mt-1 leading-relaxed">
              Select your firm to load default rules, then adjust the limits to match your specific account.
            </p>
          </div>

          <FirmSetupForm templates={templates} existing={existing} action={savePropFirmAccount} />

        </div>
      </div>
    </div>
  );
}
