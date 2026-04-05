"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface PineScriptViewProps {
  pineScript:      string;
  pineScriptNotes: string | null;
  version:         number;
}

export function PineScriptView({ pineScript, pineScriptNotes, version }: PineScriptViewProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(pineScript).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const notes = pineScriptNotes
    ? pineScriptNotes.split("\n").filter(Boolean)
    : [];

  return (
    <div className="flex flex-col gap-6 max-w-[860px] mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-primary leading-snug">
            Pine Script Indicator
          </h2>
          <p className="text-[12px] text-muted font-mono mt-0.5">
            v{version} · AI-generated draft
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "shrink-0 text-[12px] font-mono px-3 py-1.5 rounded border transition-colors",
            copied
              ? "border-accent/60 text-accent bg-[var(--accent-dim)]"
              : "border-border text-secondary hover:text-primary hover:border-border-strong"
          )}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      {/* Disclaimer banner */}
      <div className="flex gap-3 px-3 py-2.5 rounded border border-border bg-elevated text-[12px] text-secondary leading-relaxed font-mono">
        <span className="text-accent shrink-0">!</span>
        <span>
          This is an AI-generated draft. Review all conditions before using it on a live chart.
          Pine Script cannot automate discretionary or visual pattern judgements.
        </span>
      </div>

      {/* Clarifications / caveats */}
      {notes.length > 0 && (
        <div className="flex flex-col gap-1.5 px-3 py-3 rounded border border-border bg-elevated">
          <p className="text-[11px] text-muted font-mono uppercase tracking-wider mb-1">
            AI notes
          </p>
          {notes.map((note, i) => (
            <p key={i} className="text-[12px] text-secondary leading-relaxed">
              {note}
            </p>
          ))}
        </div>
      )}

      {/* Code block */}
      <div className="rounded border border-border overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-elevated border-b border-border">
          <span className="text-[11px] text-muted font-mono">Pine Script v5</span>
        </div>
        <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed font-mono text-primary bg-[var(--color-base)] whitespace-pre">
          {pineScript}
        </pre>
      </div>

    </div>
  );
}
