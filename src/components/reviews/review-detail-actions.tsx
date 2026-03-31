"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { updateReview, deleteReview } from "@/server/actions/reviews";
import type { TradeReviewRecord, TradeDirection } from "@/features/reviews/types";

interface SetupOption {
  id:   string;
  name: string;
}

interface Props {
  review: TradeReviewRecord;
  setups: SetupOption[];
}

type Panel = "none" | "edit" | "delete";

export function ReviewDetailActions({ review, setups }: Props) {
  const [panel,      setPanel]      = useState<Panel>("none");
  const [error,      setError]      = useState<string | null>(null);
  const [direction,  setDirection]  = useState<TradeDirection>(review.direction);
  const [isPending,  startTransition]  = useTransition();
  const [isDeleting, startDeleteTrans] = useTransition();

  function openEdit()   { setPanel("edit");   setError(null); }
  function openDelete() { setPanel("delete"); setError(null); }
  function close()      { setPanel("none");   setError(null); }

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data       = new FormData(e.currentTarget);
    const instrument = (data.get("instrument") as string | null)?.trim() ?? "";
    const tradeDate  = (data.get("tradeDate")  as string | null) ?? "";
    const notes      = (data.get("notes")      as string | null)?.trim() || null;

    if (!instrument) { setError("Instrument is required."); return; }
    if (!tradeDate)  { setError("Trade date is required."); return; }

    startTransition(async () => {
      const result = await updateReview(review.id, { instrument, direction, tradeDate, notes });
      if (!result.success) { setError(result.error); return; }
      // Refresh the page to show updated data.
      window.location.reload();
    });
  }

  function handleDelete() {
    setError(null);
    startDeleteTrans(async () => {
      const result = await deleteReview(review.id);
      if (result && !result.success) setError(result.error);
      // On success the server action redirects — no client action needed.
    });
  }

  const tradeDateValue = review.tradeDate.toISOString().split("T")[0];

  return (
    <div className="border-t border-border pt-6 flex flex-col gap-4">

      {/* Action links */}
      {panel === "none" && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={openEdit}
            className="text-[12px] text-muted hover:text-secondary transition-colors font-mono"
          >
            Edit trade details →
          </button>
          <button
            type="button"
            onClick={openDelete}
            className="text-[12px] text-invalid/60 hover:text-invalid transition-colors font-mono ml-auto"
          >
            Delete review
          </button>
        </div>
      )}

      {/* Edit panel */}
      <AnimatePresence>
        {panel === "edit" && (
          <motion.form
            key="edit"
            onSubmit={handleEditSubmit}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" as const }}
            className="flex flex-col gap-4 rounded border border-border-strong bg-[var(--bg-elevated)] px-5 py-4"
          >
            <p className="text-[13px] font-semibold text-primary">Edit trade details</p>
            <p className="text-[11px] text-muted -mt-2">
              Adherence marks are not editable — they form the historical record.
            </p>

            {/* Instrument */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-mono uppercase tracking-wider">Instrument</label>
              <input
                name="instrument"
                type="text"
                defaultValue={review.instrument}
                autoComplete="off"
                spellCheck={false}
                className={cn(
                  "w-full px-3 py-2 rounded border border-border bg-[var(--bg-surface)]",
                  "text-[13px] text-primary placeholder:text-muted",
                  "focus:outline-none focus:border-accent/50 transition-colors"
                )}
              />
            </div>

            {/* Direction */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-mono uppercase tracking-wider">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                {(["LONG", "SHORT"] as TradeDirection[]).map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => setDirection(dir)}
                    className={cn(
                      "py-2 rounded border-2 font-semibold text-[12px] tracking-tight transition-all",
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
              <label className="text-[11px] text-muted font-mono uppercase tracking-wider">Trade date</label>
              <input
                name="tradeDate"
                type="date"
                defaultValue={tradeDateValue}
                className={cn(
                  "w-full px-3 py-2 rounded border border-border bg-[var(--bg-surface)]",
                  "text-[13px] text-primary",
                  "focus:outline-none focus:border-accent/50 transition-colors"
                )}
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted font-mono uppercase tracking-wider">
                Notes <span className="normal-case tracking-normal text-muted/60">(optional)</span>
              </label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={review.notes ?? ""}
                className={cn(
                  "w-full px-3 py-2 rounded border border-border bg-[var(--bg-surface)]",
                  "text-[13px] text-primary leading-relaxed resize-none",
                  "focus:outline-none focus:border-accent/50 transition-colors"
                )}
              />
            </div>

            {error && <p className="text-[11px] text-invalid font-mono">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  "px-5 py-2 rounded bg-accent text-[var(--bg-base)] font-semibold text-[13px] tracking-tight",
                  "hover:opacity-90 transition-opacity disabled:opacity-40"
                )}
              >
                {isPending ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={close}
                disabled={isPending}
                className="text-[13px] text-muted hover:text-secondary transition-colors font-mono"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}

        {/* Delete confirmation panel */}
        {panel === "delete" && (
          <motion.div
            key="delete"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" as const }}
            className="flex flex-col gap-4 rounded border border-invalid/30 bg-invalid/[0.03] px-5 py-4"
          >
            <div>
              <p className="text-[13px] font-semibold text-primary mb-1">Delete this review?</p>
              <p className="text-[12px] text-secondary">
                This permanently removes the review and all rule adherence marks.
                This cannot be undone.
              </p>
            </div>
            {error && <p className="text-[11px] text-invalid font-mono">{error}</p>}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={cn(
                  "px-5 py-2 rounded border border-invalid/50 bg-invalid/10 text-invalid font-semibold text-[13px] tracking-tight",
                  "hover:bg-invalid/20 transition-colors disabled:opacity-40"
                )}
              >
                {isDeleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={close}
                disabled={isDeleting}
                className="text-[13px] text-muted hover:text-secondary transition-colors font-mono"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
