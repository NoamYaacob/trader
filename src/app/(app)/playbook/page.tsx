import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { PlaybookReview } from "@/components/playbook/playbook-review";
import { getLatestStrategy } from "@/features/strategy";
import { getLatestPlaybook } from "@/features/playbook/data/playbook";
import { retryGeneratePlaybook } from "@/server/actions/playbook";

export default async function PlaybookPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId   = session.user.id;
  const strategy = await getLatestStrategy(userId);

  // No strategy or still in draft — send them to start.
  if (!strategy || strategy.status === "DRAFT") {
    redirect("/onboarding");
  }

  // Strategy submitted/processing — AI generation may still be in flight.
  if (strategy.status === "SUBMITTED" || strategy.status === "PROCESSING") {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="Your Playbook" subtitle="generating…" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center flex flex-col items-center gap-4 max-w-[380px]">
            <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <div>
              <p className="text-[15px] font-semibold text-primary mb-1">
                Building your playbook
              </p>
              <p className="text-[13px] text-secondary leading-relaxed">
                We&apos;re processing your strategy intake and generating your rules.
                This takes a few seconds.
              </p>
            </div>
            <a
              href="/playbook"
              className="text-[12px] text-accent hover:text-primary transition-colors font-mono mt-2"
            >
              Refresh →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Strategy generation failed — surface a clear error state with retry.
  if (strategy.status === "FAILED") {
    const retryAction = async () => {
      "use server";
      await retryGeneratePlaybook(strategy.id);
    };
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="Your Playbook" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-5 max-w-[400px] text-center px-4">
            <div className="w-10 h-10 rounded-full border border-invalid/40 bg-invalid/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 5v4M8 11v.5" stroke="var(--color-invalid, #e05252)" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="8" r="6.5" stroke="var(--color-invalid, #e05252)" strokeWidth="1.2" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-primary mb-1">
                Playbook generation failed
              </p>
              <p className="text-[13px] text-secondary leading-relaxed">
                Something went wrong while generating your rules. Your strategy intake is saved — you can try again now.
              </p>
            </div>
            <form action={retryAction} className="flex flex-col items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded bg-accent text-[var(--bg-base)] font-semibold text-[13px] hover:opacity-90 transition-opacity"
              >
                Try again →
              </button>
            </form>
            <a
              href="/strategy/edit"
              className="text-[12px] text-muted hover:text-secondary transition-colors font-mono"
            >
              Edit strategy intake →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Strategy ACTIVE — load the latest playbook.
  const playbook = await getLatestPlaybook(strategy.id, userId);

  if (!playbook) {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="Your Playbook" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center flex flex-col items-center gap-3 max-w-[380px]">
            <p className="text-[15px] font-semibold text-primary">Playbook not found</p>
            <p className="text-[13px] text-secondary leading-relaxed">
              Your strategy was submitted but the playbook could not be generated.
            </p>
            <a
              href="/onboarding"
              className="text-[12px] text-accent hover:text-primary transition-colors font-mono"
            >
              Re-submit intake →
            </a>
          </div>
        </div>
      </div>
    );
  }

  const subtitle =
    playbook.status === "CONFIRMED"
      ? `v${playbook.version} · confirmed`
      : `v${playbook.version} · ${playbook.rules.length} rules · review`;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Your Playbook" subtitle={subtitle} />
      <div className="flex-1 overflow-y-auto">
        <PlaybookReview playbook={playbook} />
      </div>
    </div>
  );
}
