import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  riskRules: string;
  onChange: (value: string) => void;
}

export function StepRisk({ riskRules, onChange }: Props) {
  return (
    <div>
      <Label htmlFor="risk">Risk rules</Label>
      <p className="text-[11px] text-secondary mb-2">
        Describe your position sizing, maximum risk per trade, maximum daily
        loss, and any hard rules you follow to protect your capital.
      </p>
      <Textarea
        id="risk"
        value={riskRules}
        onChange={(e) => onChange(e.target.value)}
        placeholder="I risk no more than..."
        className="min-h-[200px]"
        autoFocus
      />
    </div>
  );
}
