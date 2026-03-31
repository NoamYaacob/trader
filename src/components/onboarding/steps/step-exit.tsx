import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  exitConditions: string;
  onChange: (value: string) => void;
}

export function StepExit({ exitConditions, onChange }: Props) {
  return (
    <div>
      <Label htmlFor="exit">Exit conditions</Label>
      <p className="text-[11px] text-muted mb-2">
        Describe your profit target and stop-loss logic. Include how and when
        you scale out, trail stops, or take partial profits.
      </p>
      <Textarea
        id="exit"
        value={exitConditions}
        onChange={(e) => onChange(e.target.value)}
        placeholder="I exit when..."
        className="min-h-[180px]"
        autoFocus
      />
    </div>
  );
}
