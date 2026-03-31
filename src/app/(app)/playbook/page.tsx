import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function PlaybookPage() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Playbook"
        subtitle="v0 · not confirmed"
        actions={
          <Button variant="secondary" size="sm" disabled>
            Edit rules
          </Button>
        }
      />

      <div className="flex-1 p-8 max-w-[900px] w-full mx-auto">
        <EmptyState
          title="No playbook confirmed."
          description="Complete the strategy intake to generate your playbook. You'll review and confirm each rule before it's locked as your source of truth."
          action={{ label: "Begin strategy intake", href: "/onboarding" }}
        />
      </div>
    </div>
  );
}
