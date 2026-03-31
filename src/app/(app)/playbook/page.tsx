import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function PlaybookPage() {
  return (
    <div className="flex flex-col">
      <TopBar
        title="Playbook"
        subtitle="No confirmed playbook."
        actions={
          <Button variant="secondary" size="sm" disabled>
            Edit Rules
          </Button>
        }
      />

      <div className="flex-1 p-8 max-w-[960px] w-full mx-auto">
        <EmptyState
          title="No confirmed playbook."
          description="Complete your strategy intake to generate your playbook. You will be able to review and confirm each rule before it becomes part of your playbook."
          action={{ label: "Complete strategy intake", href: "/onboarding" }}
        />
      </div>
    </div>
  );
}
