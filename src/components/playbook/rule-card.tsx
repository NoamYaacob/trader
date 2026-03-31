"use client";

import { useState, useTransition, useRef } from "react";
import { cn } from "@/lib/utils";
import { updateRule, removeRule, setRuleChecklist } from "@/server/actions/playbook";
import type { PlaybookRule } from "@/features/playbook/types";

interface RuleCardProps {
  rule:        PlaybookRule;
  playbookId:  string;
  readOnly?:   boolean;
  onDelete:    (ruleId: string) => void;
  onUpdate:    (ruleId: string, text: string) => void;
  onChecklist: (ruleId: string, value: boolean) => void;
}

export function RuleCard({
  rule,
  playbookId,
  readOnly,
  onDelete,
  onUpdate,
  onChecklist,
}: RuleCardProps) {
  const [editing, setEditing]        = useState(false);
  const [draft, setDraft]            = useState(rule.text);
  const [error, setError]            = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef                  = useRef<HTMLTextAreaElement>(null);

  function startEdit() {
    if (readOnly) return;
    setDraft(rule.text);
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function cancelEdit() {
    setDraft(rule.text);
    setEditing(false);
    setError(null);
  }

  function commitEdit() {
    if (draft.trim() === rule.text) { setEditing(false); return; }
    if (!draft.trim()) { setError("Rule cannot be empty."); return; }
    startTransition(async () => {
      const result = await updateRule(rule.id, playbookId, draft);
      if (!result.success) { setError(result.error); return; }
      onUpdate(rule.id, draft.trim());
      setEditing(false);
      setError(null);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEdit(); }
    if (e.key === "Escape") cancelEdit();
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await removeRule(rule.id, playbookId);
      if (!result.success) { setError(result.error); return; }
      onDelete(rule.id);
    });
  }

  function handleChecklist() {
    if (readOnly) return;
    const next = !rule.inChecklist;
    startTransition(async () => {
      const result = await setRuleChecklist(rule.id, playbookId, next);
      if (!result.success) { setError(result.error); return; }
      onChecklist(rule.id, next);
    });
  }

  return (
    <div
      className={cn(
        "group relative flex gap-3 px-3 py-3 rounded border transition-colors",
        "border-border bg-[var(--color-inset)]",
        editing && "border-accent/40",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      {/* Checklist toggle */}
      <button
        type="button"
        onClick={handleChecklist}
        disabled={readOnly}
        title={rule.inChecklist ? "In pre-trade checklist" : "Not in checklist"}
        className={cn(
          "shrink-0 mt-[2px] w-4 h-4 rounded-sm border flex items-center justify-center transition-colors",
          rule.inChecklist
            ? "border-accent bg-accent/10 text-accent"
            : "border-border-strong text-transparent",
          !readOnly && "hover:border-accent/60 cursor-pointer",
          readOnly && "cursor-default"
        )}
      >
        {rule.inChecklist && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path
              d="M1 3l2 2 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Rule content */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="w-full bg-transparent text-[13px] text-primary leading-relaxed resize-none outline-none border-none p-0 font-mono"
            />
            {error && <p className="text-[11px] text-invalid">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={commitEdit}
                disabled={isPending}
                className="text-[11px] text-accent hover:text-primary transition-colors font-mono"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-[11px] text-muted hover:text-secondary transition-colors font-mono"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p
            onClick={startEdit}
            className={cn(
              "text-[13px] text-primary leading-relaxed font-mono break-words",
              !readOnly && "cursor-text"
            )}
          >
            {rule.text}
          </p>
        )}
        {rule.source === "TRADER_ADDED" && !editing && (
          <span className="text-[10px] text-accent/60 font-mono mt-0.5 block">edited</span>
        )}
      </div>

      {/* Hover actions */}
      {!readOnly && !editing && (
        <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
          <button
            type="button"
            onClick={startEdit}
            className="text-[11px] text-muted hover:text-secondary transition-colors font-mono px-1"
            title="Edit"
          >
            edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-[11px] text-muted hover:text-invalid transition-colors font-mono px-1"
            title="Remove"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
