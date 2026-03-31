"use client";

import { useState, useTransition } from "react";
import { RuleCard } from "./rule-card";
import { addRule } from "@/server/actions/playbook";
import { CATEGORY_LABELS } from "@/features/playbook/types";
import type { PlaybookRule, RuleCategory } from "@/features/playbook/types";

interface RuleGroupProps {
  category:    RuleCategory;
  rules:       PlaybookRule[];
  playbookId:  string;
  readOnly?:   boolean;
  onDelete:    (ruleId: string) => void;
  onUpdate:    (ruleId: string, text: string) => void;
  onChecklist: (ruleId: string, value: boolean) => void;
  onAdd:       (rule: PlaybookRule) => void;
}

export function RuleGroup({
  category,
  rules,
  playbookId,
  readOnly,
  onDelete,
  onUpdate,
  onChecklist,
  onAdd,
}: RuleGroupProps) {
  const [adding, setAdding]          = useState(false);
  const [draft, setDraft]            = useState("");
  const [error, setError]            = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitAdd() {
    if (!draft.trim()) { setError("Enter rule text."); return; }
    startTransition(async () => {
      const result = await addRule(playbookId, category, draft);
      if (!result.success) { setError(result.error); return; }
      // Build a minimal PlaybookRule to hand back to the parent.
      const newRule: PlaybookRule = {
        id:          result.ruleId,
        text:        draft.trim(),
        category,
        source:      "TRADER_ADDED",
        inChecklist: true,
        order:       rules.length,
      };
      onAdd(newRule);
      setDraft("");
      setAdding(false);
      setError(null);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitAdd(); }
    if (e.key === "Escape") { setAdding(false); setDraft(""); setError(null); }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Category header */}
      <div className="flex items-center justify-between mb-1">
        <p className="label-section">{CATEGORY_LABELS[category]}</p>
        <span className="text-[11px] text-muted font-mono">{rules.length} rule{rules.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Rules */}
      {rules.length === 0 && !adding && (
        <p className="text-[12px] text-muted py-2 font-mono">No rules in this category.</p>
      )}
      {rules.map((rule) => (
        <RuleCard
          key={rule.id}
          rule={rule}
          playbookId={playbookId}
          readOnly={readOnly}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onChecklist={onChecklist}
        />
      ))}

      {/* Add rule inline form */}
      {adding && (
        <div className="flex flex-col gap-2 px-3 py-3 rounded border border-accent/30 bg-[var(--color-inset)]">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the rule…"
            rows={2}
            autoFocus
            className="w-full bg-transparent text-[13px] text-primary leading-relaxed resize-none outline-none border-none p-0 font-mono placeholder:text-muted"
          />
          {error && <p className="text-[11px] text-invalid">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submitAdd}
              disabled={isPending}
              className="text-[11px] text-accent hover:text-primary transition-colors font-mono"
            >
              Add rule
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setDraft(""); setError(null); }}
              className="text-[11px] text-muted hover:text-secondary transition-colors font-mono"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add button */}
      {!readOnly && !adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="self-start text-[11px] text-muted hover:text-accent transition-colors font-mono mt-1"
        >
          + Add rule
        </button>
      )}
    </div>
  );
}
