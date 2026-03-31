"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSetup, updateSetup } from "@/server/actions/setup";
import type { SetupRecord } from "@/features/setup/types";

interface SetupFormProps {
  // Pass existing setup for edit mode; undefined for create mode.
  setup?: SetupRecord;
}

export function SetupForm({ setup }: SetupFormProps) {
  const router = useRouter();
  const [fields, setFields] = useState({
    name:                  setup?.name                  ?? "",
    description:           setup?.description           ?? "",
    entryCondition:        setup?.entryCondition        ?? "",
    exitCondition:         setup?.exitCondition         ?? "",
    invalidationCondition: setup?.invalidationCondition ?? "",
    tags:                  setup?.tags.join(", ")       ?? "",
  });
  const [error, setError]            = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      if (setup) {
        const result = await updateSetup(setup.id, fields);
        if (!result.success) { setError(result.error); return; }
        router.push(`/setups/${setup.id}`);
      } else {
        const result = await createSetup(fields);
        // createSetup redirects on success — only reaches here on error.
        if (result && !result.success) setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-[600px]">

      {/* Name */}
      <div>
        <Label htmlFor="name">Setup name</Label>
        <p className="text-[11px] text-secondary mb-2">
          A short, recognizable name for this pattern. E.g. "Break and retest", "Opening drive".
        </p>
        <Input
          id="name"
          value={fields.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. High base breakout"
          autoFocus
        />
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tags">Tags</Label>
        <p className="text-[11px] text-secondary mb-2">
          Comma-separated. Used to filter your library. E.g. "trend, morning, high-rvol".
        </p>
        <Input
          id="tags"
          value={fields.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="trend, breakout, morning"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <p className="text-[11px] text-secondary mb-2">
          What is this setup? What market condition produces it?
        </p>
        <Textarea
          id="description"
          value={fields.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="This setup forms when..."
          className="min-h-[100px] font-sans"
        />
      </div>

      {/* Entry */}
      <div>
        <Label htmlFor="entry">Entry condition</Label>
        <p className="text-[11px] text-secondary mb-2">
          What must be true to enter this specific setup?
        </p>
        <Textarea
          id="entry"
          value={fields.entryCondition}
          onChange={(e) => set("entryCondition", e.target.value)}
          placeholder="I enter when..."
          className="min-h-[80px]"
        />
      </div>

      {/* Exit */}
      <div>
        <Label htmlFor="exit">Exit condition</Label>
        <p className="text-[11px] text-secondary mb-2">
          Target, stop, and any partials specific to this setup.
        </p>
        <Textarea
          id="exit"
          value={fields.exitCondition}
          onChange={(e) => set("exitCondition", e.target.value)}
          placeholder="I exit when..."
          className="min-h-[80px]"
        />
      </div>

      {/* Invalidation */}
      <div>
        <Label htmlFor="inv">Invalidation condition</Label>
        <p className="text-[11px] text-secondary mb-2">
          What would make you skip or abandon this setup?
        </p>
        <Textarea
          id="inv"
          value={fields.invalidationCondition}
          onChange={(e) => set("invalidationCondition", e.target.value)}
          placeholder="I skip this if..."
          className="min-h-[80px]"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="px-3 py-2.5 border-l-2 border-invalid bg-invalid/5 rounded-r">
          <p className="text-[12px] text-invalid">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? "Saving…" : setup ? "Save changes" : "Create setup →"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>

    </div>
  );
}
