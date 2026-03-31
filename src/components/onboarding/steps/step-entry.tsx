import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  entryConditions: string;
  onChange: (value: string) => void;
}

export function StepEntry({ entryConditions, onChange }: Props) {
  return (
    <div>
      <Label htmlFor="entry">Entry conditions</Label>
      <p className="text-[11px] text-secondary mb-2">
        List the specific conditions that must be true before you enter.
        Be as concrete as possible — price action, indicators, market structure,
        time of day, volume, etc.
      </p>
      <Textarea
        id="entry"
        value={entryConditions}
        onChange={(e) => onChange(e.target.value)}
        placeholder="I enter when..."
        className="min-h-[200px]"
        autoFocus
      />
    </div>
  );
}
