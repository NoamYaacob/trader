"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { regeneratePlaybook } from "@/server/actions/playbook";

interface Props {
  playbookId:      string;
  playbookVersion: number;
}

export function RegenerateConfirmView({ playbookId, playbookVersion }: Props) {
  const [notes,     setNotes]     = useState("");
  const [error,     setError]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await regeneratePlaybook(playbookId, notes.trim() || undefined);
      if (result && !result.success) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-[580px] w-full mx-auto py-12 px-4">

      {/* Context */}
      <div>
        <h1
          className="font-semibold text-primary leading-tight mb-2"
          style={{ fontSize: 22, letterSpacing: "-0.025em" }}
        >
          Regenerate playbook
        </h1>
        <p className="text-[13px] text-secondary leading-relaxed">
          Your intake changes have been saved.
          Regenerating will archive{" "}
          <span className="font-mono text-primary">v{playbookVersion}</span> and create a new draft from your updated strategy.
          Your existing training sessions and trade reviews will not be affected.
        </p>
      </div>

      {/* Version transition */}
      <div className="flex items-center gap-3 px-4 py-3 rounded border border-border bg-[var(--bg-surface)]">
        <span className="text-[12px] font-mono text-muted border border-border rounded px-2 py-0.5">
          v{playbookVersion}
        </span>
        <span className="text-[11px] text-muted font-mono">confirmed · will be archived</span>
        <span className="text-[11px] text-muted font-mono ml-auto">→</span>
        <span className="text-[12px] font-mono text-accent border border-accent/30 rounded px-2 py-0.5">
          v{playbookVersion + 1}
        </span>
        <span className="text-[11px] text-accent/70 font-mono">new draft</span>
      </div>

      {/* Revision notes — optional */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <label className="text-[12px] font-semibold text-primary">
            Revision notes
          </label>
          <span className="text-[11px] text-muted font-mono">(optional)</span>
        </div>
        <p className="text-[12px] text-secondary leading-relaxed">
          What specifically changed and why? These notes are passed to the AI alongside your intake — use them to focus the new rules or correct specific weaknesses in the previous version.
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="e.g. Tightened entry conditions to require confirmation candle. Removed the overview rule about holding overnight — I don't do that anymore. Entry now requires structure at higher timeframe…"
          className={cn(
            "w-full px-3 py-2.5 rounded border border-border bg-[var(--bg-surface)]",
            "text-[13px] text-primary placeholder:text-muted leading-relaxed resize-none",
            "focus:outline-none focus:border-accent/50 transition-colors"
          )}
        />
      </div>

      {error && (
        <p className="text-[12px] text-invalid font-mono">{error}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <a
          href="/playbook"
          className="text-[13px] text-muted hover:text-secondary transition-colors font-mono"
        >
          ← Keep current playbook
        </a>
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "px-6 py-2.5 rounded bg-accent text-[var(--bg-base)] font-semibold text-[14px] tracking-tight",
            "hover:opacity-90 transition-opacity",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {isPending ? "Generating…" : `Generate v${playbookVersion + 1} →`}
        </button>
      </div>

    </form>
  );
}
