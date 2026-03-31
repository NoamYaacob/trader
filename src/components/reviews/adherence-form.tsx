"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { submitAdherence } from "@/server/actions/reviews";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/features/playbook/types";
import type { RuleCategory } from "@/features/playbook/types";
import type { ChecklistRuleForReview, AdherenceStatus } from "@/features/reviews/types";

interface Props {
  reviewId: string;
  rules:    ChecklistRuleForReview[];
}

type RuleState = {
  status: AdherenceStatus;
  notes:  string;
};

export function AdherenceFormView({ reviewId, rules }: Props) {
  const initialState: Record<string, RuleState> = Object.fromEntries(
    rules.map((r) => [r.id, { status: "NA" as AdherenceStatus, notes: "" }])
  );

  const [ruleStates, setRuleStates] = useState<Record<string, RuleState>>(initialState);
  const [error,      setError]      = useState<string | null>(null);
  const [isPending,  startTransition] = useTransition();

  function setStatus(ruleId: string, status: AdherenceStatus) {
    setRuleStates((prev) => ({
      ...prev,
      [ruleId]: { ...prev[ruleId], status },
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const inputs = rules.map((r) => ({
        ruleId: r.id,
        status: ruleStates[r.id]?.status ?? "NA",
        notes:  ruleStates[r.id]?.notes?.trim() || null,
      }));
      const result = await submitAdherence(reviewId, inputs);
      if (result && !result.success) setError(result.error);
    });
  }

  // Group rules by category in canonical order.
  const grouped = CATEGORY_ORDER
    .map((cat) => ({
      category: cat,
      rules:    rules.filter((r) => r.category === cat),
    }))
    .filter((g) => g.rules.length > 0);

  // Summary counts for the sticky footer.
  const followed = Object.values(ruleStates).filter((s) => s.status === "FOLLOWED").length;
  const broke    = Object.values(ruleStates).filter((s) => s.status === "BROKE").length;
  const pending  = Object.values(ruleStates).filter((s) => s.status === "NA").length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {grouped.map(({ category, rules: catRules }) => (
        <div key={category}>
          <p className="text-[11px] text-muted font-mono uppercase tracking-wider mb-3">
            {CATEGORY_LABELS[category as RuleCategory]}
          </p>
          <div className="flex flex-col gap-2">
            {catRules.map((rule) => {
              const state  = ruleStates[rule.id] ?? { status: "NA", notes: "" };
              const status = state.status;

              return (
                <div
                  key={rule.id}
                  className={cn(
                    "rounded border px-4 py-3 transition-colors",
                    status === "FOLLOWED" ? "border-valid/30 bg-valid/[0.04]"
                    : status === "BROKE"   ? "border-invalid/30 bg-invalid/[0.04]"
                    : "border-border bg-[var(--bg-surface)]"
                  )}
                >
                  {/* Rule text + toggle row */}
                  <div className="flex items-start justify-between gap-4">
                    <p
                      className={cn(
                        "text-[13px] leading-snug flex-1",
                        status === "FOLLOWED" ? "text-primary"
                        : status === "BROKE"   ? "text-primary"
                        : "text-secondary"
                      )}
                    >
                      {rule.text}
                    </p>

                    {/* FOLLOWED / BROKE / N/A toggle */}
                    <div className="flex items-center gap-1 shrink-0">
                      {(["FOLLOWED", "BROKE", "NA"] as AdherenceStatus[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(rule.id, s)}
                          className={cn(
                            "px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all",
                            s === "FOLLOWED" && status === "FOLLOWED" && "bg-valid text-[var(--bg-base)]",
                            s === "FOLLOWED" && status !== "FOLLOWED" && "text-valid/60 hover:text-valid hover:bg-valid/10",
                            s === "BROKE"    && status === "BROKE"    && "bg-invalid text-[var(--bg-base)]",
                            s === "BROKE"    && status !== "BROKE"    && "text-invalid/60 hover:text-invalid hover:bg-invalid/10",
                            s === "NA"       && status === "NA"        && "bg-[var(--bg-inset)] text-secondary",
                            s === "NA"       && status !== "NA"        && "text-muted hover:text-secondary hover:bg-[var(--bg-inset)]"
                          )}
                        >
                          {s === "FOLLOWED" ? "✓" : s === "BROKE" ? "✗" : "N/A"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {error && (
        <p className="text-[11px] text-invalid font-mono">{error}</p>
      )}

      {/* Footer: tally + submit */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-mono text-valid tabular-nums">{followed} followed</span>
          <span className="text-[11px] font-mono text-invalid tabular-nums">{broke} broke</span>
          <span className="text-[11px] font-mono text-muted tabular-nums">{pending} N/A</span>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "px-6 py-2.5 rounded bg-accent text-[var(--bg-base)] font-semibold text-[13px] tracking-tight",
            "hover:opacity-90 transition-opacity",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {isPending ? "Saving…" : "Submit review →"}
        </button>
      </div>

    </form>
  );
}
