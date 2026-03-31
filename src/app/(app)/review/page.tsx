import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function ReviewPage() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Trade Review"
        actions={
          <Button variant="primary" size="sm">
            Log review
          </Button>
        }
      />

      <div className="flex-1 p-8 max-w-[760px] w-full mx-auto">
        <EmptyState
          title="No reviews logged."
          description="After a trade, log it here and score it against your playbook checklist. Discipline score — not P&L — is the output."
          action={{ label: "Log trade review", href: "/review/new" }}
        />
      </div>
    </div>
  );
}
