"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { AnnotationEditor } from "./annotation-editor";
import { deleteExample, updateExampleNotes } from "@/server/actions/setup";
import type { SetupExampleRecord, AnnotationData } from "@/features/setup/types";

interface ExampleCardProps {
  example:   SetupExampleRecord;
  setupId:   string;
  onDelete:  (exampleId: string) => void;
  onUpdate:  (exampleId: string, partial: Partial<SetupExampleRecord>) => void;
}

export function ExampleCard({ example, setupId, onDelete, onUpdate }: ExampleCardProps) {
  const [editingNotes, setEditingNotes]  = useState(false);
  const [notesDraft, setNotesDraft]      = useState(example.notes ?? "");
  const [notesError, setNotesError]      = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition]     = useTransition();

  function handleAnnotationSave(data: AnnotationData) {
    onUpdate(example.id, { annotations: data });
  }

  function saveNotes() {
    if (notesDraft === (example.notes ?? "")) { setEditingNotes(false); return; }
    startTransition(async () => {
      const result = await updateExampleNotes(example.id, setupId, notesDraft);
      if (!result.success) { setNotesError(result.error); return; }
      onUpdate(example.id, { notes: notesDraft || null });
      setEditingNotes(false);
      setNotesError(null);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteExample(example.id, setupId);
      if (!result.success) return;
      onDelete(example.id);
    });
  }

  return (
    <div className="card-surface p-4 flex flex-col gap-3">
      {/* Header: classification + delete */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border",
            example.classification === "VALID"
              ? "text-[var(--color-success)] border-[var(--color-success)]/30 bg-[var(--color-success)]/5"
              : "text-invalid border-invalid/30 bg-invalid/5"
          )}
        >
          {example.classification}
        </span>
        <div className="flex items-center gap-2">
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-[11px] text-muted hover:text-invalid transition-colors font-mono"
            >
              delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted font-mono">Remove?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="text-[11px] text-invalid hover:text-primary transition-colors font-mono"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-[11px] text-muted hover:text-secondary transition-colors font-mono"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image + annotation editor */}
      <AnnotationEditor
        exampleId={example.id}
        setupId={setupId}
        imageUrl={example.imageUrl}
        initialData={example.annotations}
        onSave={handleAnnotationSave}
      />

      {/* Notes */}
      <div>
        {editingNotes ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Add notes about this example…"
              rows={3}
              autoFocus
              className="w-full bg-[var(--color-inset)] border border-border rounded px-3 py-2 text-[12px] text-primary font-sans leading-relaxed resize-none outline-none focus:border-accent/40 transition-colors"
            />
            {notesError && (
              <p className="text-[11px] text-invalid">{notesError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveNotes}
                disabled={isPending}
                className="text-[11px] text-accent hover:text-primary transition-colors font-mono"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => { setNotesDraft(example.notes ?? ""); setEditingNotes(false); }}
                className="text-[11px] text-muted hover:text-secondary transition-colors font-mono"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setEditingNotes(true)}
            className="cursor-text"
          >
            {example.notes ? (
              <p className="text-[12px] text-secondary leading-relaxed font-sans hover:text-primary transition-colors">
                {example.notes}
              </p>
            ) : (
              <p className="text-[11px] text-muted font-mono hover:text-secondary transition-colors">
                + Add notes
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
