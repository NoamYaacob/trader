import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  whatMakesValid:   string;
  whatMakesInvalid: string;
  onChangeValid:    (value: string) => void;
  onChangeInvalid:  (value: string) => void;
}

export function StepSetups({
  whatMakesValid,
  whatMakesInvalid,
  onChangeValid,
  onChangeInvalid,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label htmlFor="valid">What makes a setup valid?</Label>
        <p className="text-[11px] text-muted mb-2">
          Describe the specific characteristics that confirm a setup is worth
          taking. What must you see?
        </p>
        <Textarea
          id="valid"
          value={whatMakesValid}
          onChange={(e) => onChangeValid(e.target.value)}
          placeholder="A valid setup has..."
          className="min-h-[140px]"
          autoFocus
        />
      </div>
      <div>
        <Label htmlFor="invalid">What makes a setup invalid or borderline?</Label>
        <p className="text-[11px] text-muted mb-2">
          Describe what distinguishes a low-quality or invalid version of this
          setup from a clean one.
        </p>
        <Textarea
          id="invalid"
          value={whatMakesInvalid}
          onChange={(e) => onChangeInvalid(e.target.value)}
          placeholder="I skip the setup if..."
          className="min-h-[140px]"
        />
      </div>
    </div>
  );
}
