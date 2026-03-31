"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { RuleGroup } from "./rule-group";
import { confirmPlaybook } from "@/server/actions/playbook";
import { groupRulesByCategory } from "@/features/playbook";
import { CATEGORY_ORDER } from "@/features/playbook/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlaybookRecord, PlaybookRule } from "@/features/playbook/types";

interface PlaybookReviewProps {
  playbook:  PlaybookRecord;
  // When true, renders in full read-only mode with no confirm bar or regenerate actions.
  // Used for the archived version view.
  archived?: boolean;
}

export function PlaybookReview({ playbook: initial, archived = false }: PlaybookReviewProps) {
  const [rules, setRules]               = useState<PlaybookRule[]>(initial.rules);
  const [confirmed, setConfirmed]       = useState(initial.status === "CONFIRMED");
  const [error, setError]               = useState<string | null>(null);
  const [isPending, startTransition]    = useTransition();

  const grouped    = groupRulesByCategory(rules);
  const checklistN = rules.filter((r) => r.inChecklist).length;
  // Read-only when archived externally OR when confirmed (no editing after confirm).
  const readOnly   = archived || confirmed;

  // ── Rule mutations ─────────────────────────────────────────────────────────

  function handleDelete(ruleId: string) {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  }

  function handleUpdate(ruleId: string, text: string) {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, text, source: "TRADER_ADDED" } : r))
    );
  }

  function handleChecklist(ruleId: string, value: boolean) {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, inChecklist: value } : r))
    );
  }

  function handleAdd(rule: PlaybookRule) {
    setRules((prev) => [...prev, rule]);
  }

  // ── Confirm ────────────────────────────────────────────────────────────────

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await confirmPlaybook(initial.id);
      if (result && !result.success) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-8 max-w-[680px] w-full mx-auto py-10 px-4 pb-32">

      {/* Version + status header */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono text-muted border border-border rounded px-2 py-0.5">
          v{initial.version}
        </span>
        <span
          className={cn(
            "text-[11px] font-mono",
            archived      ? "text-muted"
            : confirmed   ? "text-accent"
            : "text-secondary"
          )}
        >
          {archived ? "Archived" : confirmed ? "Confirmed" : "Draft — review and confirm"}
        </span>
        {!archived && (
          <a
            href="/playbook/history"
            className="text-[11px] text-muted hover:text-secondary transition-colors font-mono ml-auto"
          >
            Version history →
          </a>
        )}
      </div>

      {/* Archived banner */}
      {archived && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded border border-border bg-[var(--bg-inset)]">
          <p className="text-[12px] text-muted">
            This is an archived version. All rules are read-only.
          </p>
          <a
            href="/playbook"
            className="text-[11px] text-accent hover:text-primary transition-colors font-mono shrink-0"
          >
            ← Current version
          </a>
        </div>
      )}

      {/* AI-generated summary */}
      {initial.summary && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" as const }}
          className="card-surface p-5"
        >
          <p className="label-section mb-2">Playbook summary</p>
          <p className="text-[14px] text-secondary leading-relaxed">{initial.summary}</p>
        </motion.div>
      )}

      {/* Checklist note — only shown when not archived */}
      {!archived && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm border border-accent bg-accent/10 flex items-center justify-center">
            <svg width="6" height="5" viewBox="0 0 6 5" fill="none">
              <path d="M0.5 2.5l1.5 1.5 3.5-3.5" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[12px] text-muted">
            {checklistN} rule{checklistN !== 1 ? "s" : ""} in your pre-trade checklist.
            {!confirmed && " Click the checkbox on any rule to add or remove it."}
          </p>
        </div>
      )}

      {/* Rule groups */}
      <div className="flex flex-col gap-8">
        {CATEGORY_ORDER.map((category) => (
          <RuleGroup
            key={category}
            category={category}
            rules={grouped.get(category) ?? []}
            playbookId={initial.id}
            readOnly={readOnly}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onChecklist={handleChecklist}
            onAdd={handleAdd}
          />
        ))}
      </div>

      {/* Bottom bar — confirm bar for DRAFT */}
      {!archived && !confirmed && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-[var(--color-surface)]/95 backdrop-blur-sm">
          <div className="max-w-[680px] mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] text-primary font-semibold">
                {rules.length} rule{rules.length !== 1 ? "s" : ""} · {checklistN} in checklist
              </p>
              <p className="text-[11px] text-muted">
                Edit any rule by clicking its text. Confirm when ready.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {error && <p className="text-[11px] text-invalid text-right">{error}</p>}
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={isPending || rules.length === 0}
              >
                {isPending ? "Confirming…" : "Confirm playbook →"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit strategy intake — shown only on CONFIRMED (not archived, not draft) */}
      {!archived && confirmed && (
        <div className="border-t border-border pt-6">
          <a
            href="/strategy/edit"
            className="text-[12px] text-muted hover:text-secondary transition-colors font-mono"
          >
            Edit strategy intake →
          </a>
        </div>
      )}

    </div>
  );
}
