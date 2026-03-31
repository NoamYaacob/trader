import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  instrument: string;
  timeframe:  string;
  onChange: (field: "instrument" | "timeframe", value: string) => void;
}

export function StepInstrument({ instrument, timeframe, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label htmlFor="instrument">Instrument</Label>
        <p className="text-[11px] text-muted mb-2">
          The market, symbol, or asset class you trade.
        </p>
        <Input
          id="instrument"
          value={instrument}
          onChange={(e) => onChange("instrument", e.target.value)}
          placeholder="e.g. ES futures, NQ, EUR/USD, SPY"
          autoFocus
        />
      </div>
      <div>
        <Label htmlFor="timeframe">Timeframe</Label>
        <p className="text-[11px] text-muted mb-2">
          The primary chart timeframe you use for entries.
        </p>
        <Input
          id="timeframe"
          value={timeframe}
          onChange={(e) => onChange("timeframe", e.target.value)}
          placeholder="e.g. 5-minute, 15-minute, 1-hour, Daily"
        />
      </div>
    </div>
  );
}
