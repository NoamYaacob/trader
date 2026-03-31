"use client";

import { useState, useTransition, useRef } from "react";
import { ExampleCard } from "./example-card";
import { uploadExample } from "@/server/actions/setup";
import type { SetupExampleRecord, ExampleClassification } from "@/features/setup/types";

interface ExampleSectionProps {
  setupId:        string;
  initialExamples: SetupExampleRecord[];
}

export function ExampleSection({ setupId, initialExamples }: ExampleSectionProps) {
  const [examples, setExamples]      = useState<SetupExampleRecord[]>(initialExamples);
  const [uploading, setUploading]    = useState(false);
  const [preview, setPreview]        = useState<string | null>(null);
  const [file, setFile]              = useState<File | null>(null);
  const [classification, setClassification] = useState<ExampleClassification>("VALID");
  const [notes, setNotes]            = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef                      = useRef<HTMLInputElement>(null);

  const validExamples   = examples.filter((e) => e.classification === "VALID");
  const invalidExamples = examples.filter((e) => e.classification === "INVALID");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setUploadError(null);
  }

  function resetUploadForm() {
    setUploading(false);
    setFile(null);
    setPreview(null);
    setNotes("");
    setClassification("VALID");
    setUploadError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleUpload() {
    if (!file) { setUploadError("Select an image first."); return; }
    const formData = new FormData();
    formData.append("image", file);
    formData.append("classification", classification);
    formData.append("notes", notes);

    startTransition(async () => {
      const result = await uploadExample(setupId, formData);
      if (!result.success) { setUploadError(result.error); return; }
      // Re-fetch happens via a full page reload trick — but we want SPA feel.
      // Since server actions don't return the new record here, we reload the
      // page to get fresh data. For a better UX, the action could return the
      // new record; for now a window reload is reliable.
      window.location.reload();
    });
  }

  function handleDelete(exampleId: string) {
    setExamples((prev) => prev.filter((e) => e.id !== exampleId));
  }

  function handleUpdate(exampleId: string, partial: Partial<SetupExampleRecord>) {
    setExamples((prev) =>
      prev.map((e) => (e.id === exampleId ? { ...e, ...partial } : e))
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Upload button */}
      {!uploading && (
        <button
          type="button"
          onClick={() => setUploading(true)}
          className="self-start text-[12px] text-accent hover:text-primary transition-colors font-mono border border-accent/30 hover:border-accent/60 rounded px-3 py-1.5"
        >
          + Add example
        </button>
      )}

      {/* Upload form */}
      {uploading && (
        <div className="card-surface p-5 flex flex-col gap-4 border-accent/20">
          <p className="label-section">New example</p>

          {/* File input */}
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
              id="example-file"
            />
            {preview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-[300px] object-contain rounded border border-border bg-[var(--color-inset)]"
                />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-2 right-2 text-[11px] text-muted hover:text-invalid font-mono bg-[var(--color-surface)]/80 px-1.5 py-0.5 rounded"
                >
                  ×
                </button>
              </div>
            ) : (
              <label
                htmlFor="example-file"
                className="flex flex-col items-center justify-center gap-2 border border-dashed border-border-strong rounded p-8 cursor-pointer hover:border-accent/40 transition-colors"
              >
                <span className="text-[12px] text-secondary font-mono">Click to select image</span>
                <span className="text-[11px] text-muted">JPEG, PNG, WebP, GIF · max 10 MB</span>
              </label>
            )}
          </div>

          {/* Classification */}
          <div className="flex gap-3">
            {(["VALID", "INVALID"] as ExampleClassification[]).map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setClassification(cls)}
                className={
                  classification === cls
                    ? cls === "VALID"
                      ? "text-[11px] font-mono font-semibold uppercase tracking-wider px-3 py-1.5 rounded border text-[var(--color-success)] border-[var(--color-success)]/40 bg-[var(--color-success)]/10"
                      : "text-[11px] font-mono font-semibold uppercase tracking-wider px-3 py-1.5 rounded border text-invalid border-invalid/40 bg-invalid/10"
                    : "text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 rounded border text-muted border-border hover:border-border-strong transition-colors"
                }
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-medium text-secondary block mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What makes this a good or bad example of the setup?"
              rows={3}
              className="w-full bg-[var(--color-inset)] border border-border rounded px-3 py-2 text-[12px] text-primary font-sans leading-relaxed resize-none outline-none focus:border-accent/40 transition-colors"
            />
          </div>

          {uploadError && (
            <div className="px-3 py-2 border-l-2 border-invalid bg-invalid/5 rounded-r">
              <p className="text-[12px] text-invalid">{uploadError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isPending || !file}
              className="text-[12px] text-primary font-mono bg-accent/10 border border-accent/30 hover:bg-accent/20 transition-colors rounded px-4 py-2 disabled:opacity-50"
            >
              {isPending ? "Uploading…" : "Upload example"}
            </button>
            <button
              type="button"
              onClick={resetUploadForm}
              disabled={isPending}
              className="text-[12px] text-muted hover:text-secondary transition-colors font-mono"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* VALID examples */}
      {validExamples.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="label-section text-[var(--color-success)]/70">
            Valid examples · {validExamples.length}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {validExamples.map((ex) => (
              <ExampleCard
                key={ex.id}
                example={ex}
                setupId={setupId}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* INVALID examples */}
      {invalidExamples.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="label-section text-invalid/70">
            Invalid examples · {invalidExamples.length}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {invalidExamples.map((ex) => (
              <ExampleCard
                key={ex.id}
                example={ex}
                setupId={setupId}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {examples.length === 0 && !uploading && (
        <p className="text-[12px] text-muted font-mono py-4">
          No examples yet. Upload annotated screenshots to build your visual reference library.
        </p>
      )}
    </div>
  );
}
