import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function TrainPage() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Train"
        actions={
          <Button variant="primary" size="sm" disabled>
            Start session
          </Button>
        }
      />

      <div className="flex-1 p-8 max-w-[760px] w-full mx-auto">
        <EmptyState
          title="Nothing to train on yet."
          description="Add at least one setup with an annotated example. Training sessions are generated from your setup library and playbook rules."
          action={{ label: "Go to Setup Library", href: "/setups" }}
        />
      </div>
    </div>
  );
}
