import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function ReviewPage() {
  return (
    <div className="flex flex-col">
      <TopBar
        title="Trade Review"
        actions={
          <Button variant="primary" size="sm">
            Log Trade Review
          </Button>
        }
      />

      <div className="flex-1 p-8 max-w-[800px] w-full mx-auto">
        <EmptyState
          title="No reviews logged."
          description="After your next trade, log it here to measure how closely you followed your playbook rules."
          action={{ label: "Log trade review", href: "/review/new" }}
        />
      </div>
    </div>
  );
}
