"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { startReview } from "@/server/actions/reviews";
import type { TradeDirection } from "@/features/reviews/types";

interface SetupOption {
  id:   string;
  name: string;
}

interface Props {
  setups: SetupOption[];
}

export function TradeFormView({ setups }: Props) {
  const [direction, setDirection] = useState<TradeDirection>("LONG");
  const [setupId,   setSetupId]   = useState<string>("");
  const [error,     setError]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Default trade date to today (local).
  const today = new Date().toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);

    const instrument = (data.get("instrument") as string | null)?.trim() ?? "";
    const tradeDate  = (data.get("tradeDate")  as string | null) ?? "";
    const notes      = (data.get("notes")      as string | null)?.trim() || null;

    if (!instrument) { setError("Instrument is required."); return; }
    if (!tradeDate)  { setError("Trade date is required."); return; }

    startTransition(async () => {
      const result = await startReview({
        instrument,
        direction,
        tradeDate,
        setupId:  setupId || null,
        notes,
      });
      if (result && !result.success) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Instrument */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-muted font-mono uppercase tracking-wider">
          Instrument
        </label>
        <input
          name="instrument"
          type="text"
          placeholder="e.g. ES, NQ, AAPL"
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "w-full px-3 py-2.5 rounded border border-border bg-[var(--bg-surface)]",
            "text-[13px] text-primary placeholder:text-muted",
            "focus:outline-none focus:border-accent/50 transition-colors"
          )}
        />
      </div>

      {/* Direction */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-muted font-mono uppercase tracking-wider">
          Direction
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["LONG", "SHORT"] as TradeDirection[]).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => setDirection(dir)}
              className={cn(
                "py-2.5 rounded border-2 font-semibold text-[13px] tracking-tight transition-all",
                direction === dir
                  ? dir === "LONG"
                    ? "border-valid bg-valid text-[var(--bg-base)]"
                    : "border-invalid bg-invalid text-[var(--bg-base)]"
                  : dir === "LONG"
                    ? "border-valid/30 text-valid hover:border-valid/60"
                    : "border-invalid/30 text-invalid hover:border-invalid/60"
              )}
            >
              {dir === "LONG" ? "Long" : "Short"}
            </button>
          ))}
        </div>
      </div>

      {/* Trade date */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-muted font-mono uppercase tracking-wider">
          Trade date
        </label>
        <input
          name="tradeDate"
          type="date"
          defaultValue={today}
          className={cn(
            "w-full px-3 py-2.5 rounded border border-border bg-[var(--bg-surface)]",
            "text-[13px] text-primary",
            "focus:outline-none focus:border-accent/50 transition-colors"
          )}
        />
      </div>

      {/* Setup — optional */}
      {setups.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-muted font-mono uppercase tracking-wider">
            Setup <span className="normal-case tracking-normal text-muted/60">(optional)</span>
          </label>
          <select
            value={setupId}
            onChange={(e) => setSetupId(e.target.value)}
            className={cn(
              "w-full px-3 py-2.5 rounded border border-border bg-[var(--bg-surface)]",
              "text-[13px] text-primary",
              "focus:outline-none focus:border-accent/50 transition-colors"
            )}
          >
            <option value="">No setup selected</option>
            {setups.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Notes — optional */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-muted font-mono uppercase tracking-wider">
          Notes <span className="normal-case tracking-normal text-muted/60">(optional)</span>
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Context, observations, market conditions…"
          className={cn(
            "w-full px-3 py-2.5 rounded border border-border bg-[var(--bg-surface)]",
            "text-[13px] text-primary placeholder:text-muted leading-relaxed resize-none",
            "focus:outline-none focus:border-accent/50 transition-colors"
          )}
        />
      </div>

      {error && (
        <p className="text-[11px] text-invalid font-mono">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full py-3.5 rounded bg-accent text-[var(--bg-base)] font-semibold text-[14px] tracking-tight",
          "hover:opacity-90 transition-opacity",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        {isPending ? "Starting review…" : "Continue to checklist →"}
      </button>

    </form>
  );
}
