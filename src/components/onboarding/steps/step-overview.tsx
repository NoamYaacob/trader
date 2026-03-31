import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  overview: string;
  onChange: (value: string) => void;
}

export function StepOverview({ overview, onChange }: Props) {
  return (
    <div>
      <Label htmlFor="overview">Strategy overview</Label>
      <p className="text-[11px] text-muted mb-2">
        Write freely. Describe the market conditions you look for, your overall
        edge, and how you think about the trades you take.
      </p>
      <Textarea
        id="overview"
        value={overview}
        onChange={(e) => onChange(e.target.value)}
        placeholder="My strategy focuses on..."
        className="min-h-[180px]"
        autoFocus
      />
    </div>
  );
}
