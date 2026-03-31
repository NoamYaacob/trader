import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function SetupsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Setup Library"
        subtitle="0 setups"
        actions={
          <Button variant="primary" size="sm">
            + Add Setup
          </Button>
        }
      />

      <div className="flex-1 p-8 max-w-[1060px] w-full mx-auto">
        <EmptyState
          title="No setups yet."
          description="Name a setup, describe the entry and exit conditions, and upload annotated screenshots. Your library trains your eye for what to take — and what to skip."
          action={{ label: "Add first setup", href: "/setups/new" }}
        />
      </div>
    </div>
  );
}
