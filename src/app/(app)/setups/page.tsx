import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function SetupsPage() {
  return (
    <div className="flex flex-col">
      <TopBar
        title="Setup Library"
        subtitle="0 setups"
        actions={
          <Button variant="primary" size="sm">
            + Add Setup
          </Button>
        }
      />

      <div className="flex-1 p-8 max-w-[1100px] w-full mx-auto">
        <EmptyState
          title="No setups yet."
          description="Build your library by naming and documenting your trade setups. Add annotated screenshots to train your eye for valid and invalid examples."
          action={{ label: "Add first setup", href: "/setups/new" }}
        />
      </div>
    </div>
  );
}
