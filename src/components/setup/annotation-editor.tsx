"use client";

import { useState, useTransition, useRef } from "react";
import { cn } from "@/lib/utils";
import { saveExampleAnnotations } from "@/server/actions/setup";
import type { AnnotationData, Annotation } from "@/features/setup/types";

interface AnnotationEditorProps {
  exampleId:    string;
  setupId:      string;
  imageUrl:     string;
  initialData:  AnnotationData;
  onSave:       (data: AnnotationData) => void;
}

export function AnnotationEditor({
  exampleId,
  setupId,
  imageUrl,
  initialData,
  onSave,
}: AnnotationEditorProps) {
  const [editing, setEditing]        = useState(false);
  const [markers, setMarkers]        = useState<Annotation[]>(initialData.markers);
  const [saved, setSaved]            = useState(false);
  const [error, setError]            = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const containerRef                 = useRef<HTMLDivElement>(null);

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!editing) return;
    // Ignore clicks on existing markers.
    if ((e.target as HTMLElement).dataset.marker) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width)  * 100;
    const y    = ((e.clientY - rect.top)  / rect.height) * 100;
    setMarkers((prev) => [...prev, { x, y }]);
  }

  function removeMarker(index: number) {
    setMarkers((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    const data: AnnotationData = { markers };
    startTransition(async () => {
      const result = await saveExampleAnnotations(exampleId, setupId, data);
      if (!result.success) { setError(result.error); return; }
      setSaved(true);
      setEditing(false);
      onSave(data);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  function handleCancel() {
    setMarkers(initialData.markers);
    setEditing(false);
    setError(null);
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Image + markers */}
      <div
        ref={containerRef}
        onClick={handleImageClick}
        className={cn(
          "relative select-none overflow-hidden rounded border border-border max-w-[680px] mx-auto",
          editing && "cursor-crosshair ring-1 ring-accent/40"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Setup example"
          className="w-full h-auto block max-h-[420px] object-contain"
          draggable={false}
        />

        {/* Annotation markers */}
        {markers.map((marker, i) => (
          <button
            key={i}
            data-marker="true"
            type="button"
            onClick={(e) => {
              if (!editing) return;
              e.stopPropagation();
              removeMarker(i);
            }}
            style={{
              position:  "absolute",
              left:      `${marker.x}%`,
              top:       `${marker.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            title={editing ? "Click to remove" : `Marker ${i + 1}`}
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              "text-[10px] font-bold font-mono leading-none",
              "bg-accent text-[var(--color-base)] border border-accent/60",
              "shadow-sm transition-transform",
              editing && "hover:scale-110 hover:bg-invalid hover:border-invalid cursor-pointer"
            )}
          >
            {i + 1}
          </button>
        ))}

        {/* Edit-mode overlay hint */}
        {editing && markers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-[11px] text-accent/70 font-mono bg-[var(--color-base)]/60 px-2 py-1 rounded">
              Click to place markers
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-[11px] text-muted hover:text-accent transition-colors font-mono"
            >
              {markers.length > 0 ? `${markers.length} marker${markers.length !== 1 ? "s" : ""} · edit` : "Add annotations"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="text-[11px] text-accent hover:text-primary transition-colors font-mono"
              >
                {isPending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="text-[11px] text-muted hover:text-secondary transition-colors font-mono"
              >
                Cancel
              </button>
              {markers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMarkers([])}
                  className="text-[11px] text-muted hover:text-invalid transition-colors font-mono"
                >
                  Clear all
                </button>
              )}
            </>
          )}
        </div>
        {saved && (
          <span className="text-[11px] text-accent font-mono">Saved ✓</span>
        )}
        {error && (
          <span className="text-[11px] text-invalid font-mono">{error}</span>
        )}
      </div>
    </div>
  );
}
