import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  invalidationConditions: string;
  onChange: (value: string) => void;
}

export function StepInvalidation({ invalidationConditions, onChange }: Props) {
  return (
    <div>
      <Label htmlFor="invalidation">Invalidation conditions</Label>
      <p className="text-[11px] text-muted mb-2">
        What would make you skip this trade entirely? What would cause you to
        exit before your target? Include conditions that make a setup low
        probability or against your rules.
      </p>
      <Textarea
        id="invalidation"
        value={invalidationConditions}
        onChange={(e) => onChange(e.target.value)}
        placeholder="I do not take the trade if..."
        className="min-h-[180px]"
        autoFocus
      />
    </div>
  );
}
