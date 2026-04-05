import type { StrategySpec } from "@/features/ai/types";

interface StrategySpecViewProps {
  spec:    StrategySpec;
  version: number;
}

// ── Primitives ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-mono text-muted uppercase tracking-wider border-b border-border pb-1.5">
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[11px] text-muted w-[160px] shrink-0 leading-relaxed">{label}</span>
      <span className={`text-[13px] text-primary leading-relaxed break-words min-w-0 ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function NullRow({ label }: { label: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[11px] text-muted w-[160px] shrink-0 leading-relaxed">{label}</span>
      <span className="text-[12px] text-muted font-mono italic">not specified</span>
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "warning" | "ok" }) {
  const styles = {
    default: "bg-elevated border-border text-secondary",
    warning: "bg-[rgba(201,122,61,0.12)] border-[rgba(201,122,61,0.35)] text-[var(--status-warning)]",
    ok:      "bg-[rgba(61,168,130,0.10)] border-[rgba(61,168,130,0.30)] text-[var(--status-valid)]",
  };
  return (
    <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded border leading-none ${styles[variant]}`}>
      {children}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function StrategySpecView({ spec, version }: StrategySpecViewProps) {
  const hasUnresolved = spec.unresolvedFields.length > 0;

  return (
    <div className="flex flex-col gap-8 max-w-[720px] mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-primary leading-snug">
            Strategy Spec
          </h2>
          <p className="text-[12px] text-muted font-mono mt-0.5">
            v{version} · normalized from intake · read-only
          </p>
        </div>
        {hasUnresolved && (
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[rgba(201,122,61,0.35)] bg-[rgba(201,122,61,0.08)]">
            <span className="text-[var(--status-warning)] text-[11px] font-mono">
              {spec.unresolvedFields.length} unresolved
            </span>
          </div>
        )}
      </div>

      {/* Unresolved banner */}
      {hasUnresolved && (
        <div className="flex flex-col gap-2 px-3 py-3 rounded border border-[rgba(201,122,61,0.30)] bg-[rgba(201,122,61,0.07)]">
          <p className="text-[11px] font-mono text-[var(--status-warning)] uppercase tracking-wider">
            Ambiguous or missing fields
          </p>
          {spec.unresolvedFields.map((f, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-[12px] font-mono text-[var(--status-warning)] shrink-0 mt-px">
                {f.field}
              </span>
              <span className="text-[12px] text-secondary leading-relaxed">
                — {f.reason}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Market context */}
      <Section title="Market context">
        <Row label="Instrument"   value={spec.market.instrument}          mono />
        <Row label="Timeframe"    value={`${spec.market.timeframe}m`}     mono />
        {spec.market.htfTimeframe
          ? <Row label="HTF context"  value={`${spec.market.htfTimeframe}m`} mono />
          : <NullRow label="HTF context" />}
        {spec.market.sessionFilter
          ? <Row label="Session filter" value={spec.market.sessionFilter}   mono />
          : <NullRow label="Session filter" />}
      </Section>

      {/* Swing definition */}
      <Section title="Swing definition">
        {spec.swingDefinition ? (
          <>
            <Row label="Pivot lookback"  value={`${spec.swingDefinition.pivotLookback} bars`} mono />
            <Row label="Description"     value={spec.swingDefinition.description} />
          </>
        ) : (
          <NullRow label="Pivot lookback" />
        )}
      </Section>

      {/* Sweep rule */}
      <Section title="Sweep rule">
        {spec.sweepRule ? (
          <>
            <Row label="Direction"       value={<Badge variant="ok">{spec.sweepRule.direction}</Badge>} />
            <Row label="Reference level" value={spec.sweepRule.referenceLevel} mono />
            {spec.sweepRule.customReference && (
              <Row label="Custom ref"    value={spec.sweepRule.customReference} />
            )}
            <Row label="Close confirm"   value={spec.sweepRule.confirmClose} mono />
            {spec.sweepRule.atrMargin != null
              ? <Row label="ATR margin"  value={`${spec.sweepRule.atrMargin}×`} mono />
              : <Row label="ATR margin"  value="exact pierce" mono />}
          </>
        ) : (
          <NullRow label="Sweep rule" />
        )}
      </Section>

      {/* Rejection rule */}
      <Section title="Rejection rule">
        {spec.rejectionRule ? (
          <>
            <Row label="Wick side"       value={spec.rejectionRule.wickSide}                                   mono />
            <Row label="Wick / body ratio" value={`≥ ${spec.rejectionRule.wickToBodyRatio}×`}               mono />
          </>
        ) : (
          <NullRow label="Rejection rule" />
        )}
      </Section>

      {/* Displacement rule */}
      <Section title="Displacement rule">
        {spec.displacementRule ? (
          <>
            <Row label="Direction"       value={<Badge variant="ok">{spec.displacementRule.direction}</Badge>} />
            <Row label="Body ≥"          value={`${spec.displacementRule.atrMultiplier}× ATR(14)`}            mono />
          </>
        ) : (
          <NullRow label="Displacement rule" />
        )}
      </Section>

      {/* FVG rule */}
      <Section title="FVG rule">
        {spec.fvgRule ? (
          <>
            <Row label="Type"            value={<Badge variant="ok">{spec.fvgRule.type}</Badge>} />
            <Row label="Max bars after sweep" value={`${spec.fvgRule.maxBarsAfterSweep} bars`}  mono />
          </>
        ) : (
          <NullRow label="FVG rule" />
        )}
      </Section>

      {/* Entry model */}
      <Section title="Entry model">
        {spec.entryModel ? (
          <>
            <Row label="Trigger"         value={spec.entryModel.trigger}                                       mono />
            <Row label="Min bars after FVG" value={`${spec.entryModel.minBarsAfterFvg} bar${spec.entryModel.minBarsAfterFvg === 1 ? "" : "s"}`} mono />
            <Row label="Requires signal bar" value={spec.entryModel.requireSignalBar ? "yes" : "no"}          mono />
          </>
        ) : (
          <NullRow label="Entry model" />
        )}
      </Section>

      {/* Stop / invalidation */}
      <Section title="Stop / invalidation">
        {spec.stopRule ? (
          <>
            <Row label="Placement"       value={spec.stopRule.placement}                                       mono />
            <Row label="ATR buffer"      value={`${spec.stopRule.atrBuffer}× ATR`}                            mono />
          </>
        ) : (
          <NullRow label="Stop rule" />
        )}
      </Section>

      {/* Target model */}
      <Section title="Target model">
        {spec.targetModel ? (
          <>
            <Row label="Type"            value={spec.targetModel.type}                                         mono />
            {spec.targetModel.rrRatio != null && (
              <Row label="R:R"           value={`${spec.targetModel.rrRatio}R`}                                mono />
            )}
            {spec.targetModel.structuralDesc && (
              <Row label="Description"   value={spec.targetModel.structuralDesc} />
            )}
          </>
        ) : (
          <NullRow label="Target model" />
        )}
      </Section>

      {/* Risk rules */}
      <Section title="Risk rules">
        {spec.riskRules ? (
          <>
            {spec.riskRules.maxRiskPercent != null
              ? <Row label="Max risk per trade" value={`${spec.riskRules.maxRiskPercent}%`}                   mono />
              : <NullRow label="Max risk per trade" />}
            {spec.riskRules.description && (
              <Row label="Notes"               value={spec.riskRules.description} />
            )}
          </>
        ) : (
          <NullRow label="Risk rules" />
        )}
      </Section>

      {/* Valid filters */}
      {spec.validFilters.length > 0 && (
        <Section title="Valid setup filters">
          {spec.validFilters.map((f, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-[var(--status-valid)] text-[11px] font-mono mt-0.5 shrink-0">✓</span>
              <span className="text-[13px] text-secondary leading-relaxed">{f}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Marginal filters */}
      {spec.marginalFilters.length > 0 && (
        <Section title="Marginal / skip filters">
          {spec.marginalFilters.map((f, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-[var(--status-warning)] text-[11px] font-mono mt-0.5 shrink-0">~</span>
              <span className="text-[13px] text-secondary leading-relaxed">{f}</span>
            </div>
          ))}
        </Section>
      )}

    </div>
  );
}
