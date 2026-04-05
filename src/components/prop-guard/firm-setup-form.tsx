"use client";

import { useState } from "react";
import type { PropFirmTemplateRecord, PropFirmAccountRecord } from "@/features/prop-guard/types";
import { PRODUCT_TYPE_LABELS } from "@/features/prop-guard/types";

interface FirmSetupFormProps {
  templates: PropFirmTemplateRecord[];
  existing:  PropFirmAccountRecord | null;
  action:    (formData: FormData) => Promise<never>;
}

export function FirmSetupForm({ templates, existing, action }: FirmSetupFormProps) {
  const [selected, setSelected] = useState<PropFirmTemplateRecord | null>(
    existing?.templateId
      ? (templates.find((t) => t.id === existing.templateId) ?? null)
      : null
  );

  const def = selected ?? null;

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="templateId" value={selected?.id ?? ""} />

      {/* Firm selector */}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-[11px] text-muted font-mono uppercase tracking-wider mb-2">
          Select your firm
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                setSelected(tpl);
              }}
              className={[
                "text-left px-3 py-2.5 rounded border text-[13px] transition-colors",
                selected?.id === tpl.id
                  ? "border-accent bg-[var(--accent-dim)] text-primary"
                  : "border-border bg-elevated text-secondary hover:border-border-strong hover:text-primary",
              ].join(" ")}
            >
              {tpl.displayName}
            </button>
          ))}
        </div>
        {def?.notes && (
          <p className="text-[11px] text-muted leading-relaxed mt-1 px-1">{def.notes}</p>
        )}
      </fieldset>

      {/* Firm name (editable) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-muted font-mono uppercase tracking-wider">Firm name</label>
        <input
          type="text" name="firmName" required
          defaultValue={existing?.firmName ?? selected?.displayName ?? ""}
          key={selected?.id}
          placeholder="e.g. Apex Trader Funding"
          className="bg-elevated border border-border rounded px-3 py-2.5 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {/* Account size + product type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-muted font-mono uppercase tracking-wider">Account size ($)</label>
          <input
            type="number" name="accountSize" required min="1000" step="1000"
            defaultValue={existing?.accountSize ?? 50000}
            className="bg-elevated border border-border rounded px-3 py-2.5 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-muted font-mono uppercase tracking-wider">Account type</label>
          <select
            name="productType"
            defaultValue={existing?.productType ?? "EVALUATION"}
            className="bg-elevated border border-border rounded px-3 py-2.5 text-[13px] text-primary focus:outline-none focus:border-accent"
          >
            {(Object.entries(PRODUCT_TYPE_LABELS) as [string, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Daily loss limit */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-muted font-mono uppercase tracking-wider">
          Daily loss limit ($)
        </label>
        <input
          type="number" name="dailyLossLimit" required min="1" step="50"
          defaultValue={existing?.dailyLossLimit ?? def?.defaultDailyLoss ?? 1000}
          key={`dl-${selected?.id}`}
          className="bg-elevated border border-border rounded px-3 py-2.5 text-[13px] text-primary focus:outline-none focus:border-accent"
        />
        <p className="text-[11px] text-muted">The maximum dollar loss allowed in a single trading day.</p>
      </div>

      {/* Rule toggles */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-[11px] text-muted font-mono uppercase tracking-wider mb-1">
          Firm rules
        </legend>
        {[
          { name: "eodFlatRule",      label: "EOD flat rule",       desc: "Must be flat by end of trading day",            defaultVal: existing?.eodFlatRule      ?? def?.eodFlatRule      ?? false },
          { name: "trailingDrawdown", label: "Trailing drawdown",   desc: "Max drawdown trails your account high-water mark", defaultVal: existing?.trailingDrawdown ?? def?.trailingDrawdown ?? false },
          { name: "consistencyRule",  label: "Consistency rule",    desc: "No single day can be a disproportionate share of profit", defaultVal: existing?.consistencyRule  ?? def?.consistencyRule  ?? false },
        ].map((rule) => (
          <label key={rule.name} className="flex items-start gap-3 px-3 py-3 rounded border border-border bg-elevated cursor-pointer hover:border-border-strong has-[:checked]:border-accent/50 has-[:checked]:bg-[var(--accent-dim)]">
            <input type="checkbox" name={rule.name} defaultChecked={rule.defaultVal} className="mt-0.5 accent-[var(--accent)]" />
            <div>
              <p className="text-[13px] text-primary">{rule.label}</p>
              <p className="text-[11px] text-muted mt-0.5">{rule.desc}</p>
            </div>
          </label>
        ))}
      </fieldset>

      <button type="submit" className="w-full py-3 rounded bg-accent text-[var(--bg-base)] font-semibold text-[13px] hover:opacity-90 transition-opacity">
        Continue to guardrails →
      </button>
    </form>
  );
}
