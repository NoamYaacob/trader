import { TopBar } from "@/components/layout/top-bar";
import { StatCard } from "@/components/shared/stat-card";
import { NextActionCard } from "@/components/shared/next-action-card";
import { EmptyState } from "@/components/shared/empty-state";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Dashboard" subtitle="No playbook confirmed" />

      <div className="flex-1 p-8 space-y-5 max-w-[1060px] w-full mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Setups"        value="—" />
          <StatCard label="Sessions"      value="—" />
          <StatCard label="Last score"    value="—" detail="no data" />
          <StatCard label="This week"     value="—" detail="0 sessions" />
        </div>

        {/* Next action */}
        <NextActionCard
          title="Start with your strategy intake."
          description="Describe your strategy in plain language. We'll formalize it into a playbook you can train against."
          cta="Begin intake"
          href="/onboarding"
        />

        {/* Activity columns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-surface p-5 flex flex-col gap-3">
            <p className="label-section">Recent Sessions</p>
            <EmptyState
              title="No sessions yet."
              description="Add a setup with an annotated example before running your first training session."
            />
          </div>

          <div className="card-surface p-5 flex flex-col gap-3">
            <p className="label-section">Recent Reviews</p>
            <EmptyState
              title="No reviews logged."
              description="After a trade, log it here to measure how closely you followed your rules."
            />
          </div>
        </div>

        {/* Setup preview */}
        <div className="card-surface p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="label-section">Your Setups</p>
            <a
              href="/setups"
              className="text-[11px] text-secondary hover:text-primary transition-colors font-mono"
            >
              View all →
            </a>
          </div>
          <EmptyState
            title="No setups yet."
            description="Build your setup library to enable training sessions."
            action={{ label: "Add first setup", href: "/setups" }}
          />
        </div>

      </div>
    </div>
  );
}
