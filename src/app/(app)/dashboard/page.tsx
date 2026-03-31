import { TopBar } from "@/components/layout/top-bar";
import { StatCard } from "@/components/shared/stat-card";
import { NextActionCard } from "@/components/shared/next-action-card";
import { EmptyState } from "@/components/shared/empty-state";

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <TopBar
        title="Dashboard"
        subtitle="No playbook confirmed."
      />

      <div className="flex-1 p-8 max-w-[1100px] w-full mx-auto space-y-6">

        {/* Stat row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Setups"       value="—" />
          <StatCard label="Sessions"     value="—" />
          <StatCard label="Last Session" value="—" />
          <StatCard label="This Week"    value="—" />
        </div>

        {/* Next action */}
        <NextActionCard
          title="Confirm your playbook."
          description="Review and confirm your generated rules before training."
          cta="Review Playbook"
          href="/playbook"
        />

        {/* Two-column activity */}
        <div className="grid grid-cols-2 gap-5">
          {/* Recent sessions */}
          <div className="card-surface p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="label-section">Recent Sessions</p>
            </div>
            <EmptyState
              title="No sessions yet."
              description="Add a setup with an example to begin training."
            />
          </div>

          {/* Recent reviews */}
          <div className="card-surface p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="label-section">Recent Reviews</p>
            </div>
            <EmptyState
              title="No reviews logged."
              description="After a trade, log it here to measure rule adherence."
            />
          </div>
        </div>

        {/* Setup preview */}
        <div className="card-surface p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="label-section">Your Setups</p>
            <a href="/setups" className="text-[12px] text-muted hover:text-secondary transition-colors">
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
