"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { recordAttempt, completeSession } from "@/server/actions/training";
import type { ExampleForTraining, AttemptResult } from "@/features/training/types";
import type { PlaybookRule } from "@/features/playbook/types";

interface Props {
  sessionId:       string;
  examples:        ExampleForTraining[];
  // Pre-filled from a prior partial session (resume support).
  initialAttempts: Record<string, { userAnswer: "VALID" | "INVALID"; isCorrect: boolean }>;
  checklistRules:  PlaybookRule[];
}

type Phase = "question" | "feedback";

interface FeedbackState {
  isCorrect:            boolean;
  actualClassification: "VALID" | "INVALID";
  exampleNotes:         string | null;
  userAnswer:           "VALID" | "INVALID";
}

export function TrainingSessionView({
  sessionId,
  examples,
  initialAttempts,
  checklistRules,
}: Props) {
  const firstUnanswered = examples.findIndex((e) => !(e.id in initialAttempts));
  const [currentIdx, setCurrentIdx] = useState(
    firstUnanswered === -1 ? examples.length - 1 : firstUnanswered
  );
  const [phase, setPhase]       = useState<Phase>("question");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const current = examples[currentIdx];
  const total   = examples.length;
  const isLast  = currentIdx === total - 1;

  // Progress: count of answered examples (advances only when feedback is shown).
  const answeredCount = currentIdx + (phase === "feedback" ? 1 : 0);
  const progressPct   = (answeredCount / total) * 100;

  // Entry rules from checklist — shown only on incorrect answers as reference.
  const entryRules = checklistRules.filter((r) => r.category === "ENTRY").slice(0, 3);

  function handleAnswer(answer: "VALID" | "INVALID") {
    if (phase !== "question" || isPending) return;
    setError(null);

    startTransition(async () => {
      const result = await recordAttempt(sessionId, current.id, answer);
      if ("success" in result && !result.success) {
        if (result.error === "Already answered.") { advance(); return; }
        setError(result.error);
        return;
      }
      const r = result as AttemptResult;
      setFeedback({
        isCorrect:            r.isCorrect,
        actualClassification: r.actualClassification,
        exampleNotes:         r.exampleNotes,
        userAnswer:           answer,
      });
      setPhase("feedback");
    });
  }

  function advance() {
    setFeedback(null);
    setPhase("question");
    setCurrentIdx((i) => i + 1);
  }

  function handleNext() {
    if (isPending) return;
    if (isLast) {
      startTransition(async () => {
        const result = await completeSession(sessionId);
        if (result && !result.success) setError(result.error);
      });
    } else {
      advance();
    }
  }

  return (
    <div className="flex flex-col min-h-full">

      {/* Minimal training header */}
      <div className="flex items-center justify-between px-6 h-12 border-b border-border shrink-0">
        <Link
          href="/training"
          className="text-[11px] text-muted hover:text-secondary transition-colors font-mono"
        >
          ← Exit
        </Link>
        <span className="text-[13px] font-semibold text-primary tracking-tight">
          {current.setupName}
        </span>
        <span className="text-[11px] text-muted font-mono tabular-nums">
          {currentIdx + 1} / {total}
        </span>
      </div>

      {/* Progress bar — advances when feedback is revealed */}
      <div className="h-px bg-[var(--bg-inset)] shrink-0">
        <div
          className="h-full bg-accent/60 transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Content — image stays static; only the bottom section animates */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[760px] w-full mx-auto px-4 pt-5 pb-12">

          {/* Setup context — always visible */}
          <div className="flex items-center gap-3 mb-4 min-h-[22px]">
            {current.setupTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono text-muted border border-border rounded px-1.5 py-0.5"
              >
                {tag}
              </span>
            ))}
            {current.entryCondition && (
              <p className="text-[11px] text-muted leading-snug truncate">
                {current.entryCondition}
              </p>
            )}
          </div>

          {/* Chart image — static, never animates */}
          <div className="relative rounded border border-border overflow-hidden bg-[var(--bg-inset)] mb-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.imageUrl}
              alt="Setup example"
              className="w-full h-auto block"
              draggable={false}
            />
            {/* Annotation markers */}
            {current.annotationData.markers.map((marker, i) => (
              <div
                key={i}
                style={{
                  position:  "absolute",
                  left:      `${marker.x}%`,
                  top:       `${marker.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className="w-6 h-6 rounded-full bg-accent text-[var(--bg-base)] flex items-center justify-center text-[10px] font-bold font-mono pointer-events-none shadow-sm"
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Bottom section — animates between question and feedback */}
          <AnimatePresence mode="wait">
            {phase === "question" ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14, ease: "easeOut" as const }}
              >
                <QuestionBottom
                  onAnswer={handleAnswer}
                  isPending={isPending}
                  error={error}
                />
              </motion.div>
            ) : feedback ? (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" as const }}
              >
                <FeedbackBottom
                  feedback={feedback}
                  checklistRules={entryRules}
                  isLast={isLast}
                  isPending={isPending}
                  onNext={handleNext}
                  error={error}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

// ── Question bottom ────────────────────────────────────────────────────────

function QuestionBottom({
  onAnswer,
  isPending,
  error,
}: {
  onAnswer:  (answer: "VALID" | "INVALID") => void;
  isPending: boolean;
  error:     string | null;
}) {
  return (
    <div className="pt-6">
      {/* Central question */}
      <p
        className="text-center text-primary font-semibold mb-6 tracking-tight"
        style={{ fontSize: 15 }}
      >
        Is this a valid setup?
      </p>

      {/* Decision buttons — fill on hover for decisive feel */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onAnswer("VALID")}
          disabled={isPending}
          className={cn(
            "py-5 rounded border-2 font-semibold text-[15px] tracking-tight transition-all",
            "border-valid/40 text-valid",
            "hover:bg-valid hover:border-valid hover:text-[var(--bg-base)]",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          Valid
        </button>
        <button
          type="button"
          onClick={() => onAnswer("INVALID")}
          disabled={isPending}
          className={cn(
            "py-5 rounded border-2 font-semibold text-[15px] tracking-tight transition-all",
            "border-invalid/40 text-invalid",
            "hover:bg-invalid hover:border-invalid hover:text-[var(--bg-base)]",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          Invalid
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-invalid font-mono text-center mt-3">{error}</p>
      )}
    </div>
  );
}

// ── Feedback bottom ────────────────────────────────────────────────────────

function FeedbackBottom({
  feedback,
  checklistRules,
  isLast,
  isPending,
  onNext,
  error,
}: {
  feedback:       FeedbackState;
  checklistRules: PlaybookRule[];
  isLast:         boolean;
  isPending:      boolean;
  onNext:         () => void;
  error:          string | null;
}) {
  const { isCorrect, actualClassification, exampleNotes, userAnswer } = feedback;

  return (
    <div className="pt-5 flex flex-col gap-4">

      {/* Classification reveal — the truth leads, not the grade */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={cn(
              "font-semibold leading-none tracking-tight mb-1.5",
              actualClassification === "VALID" ? "text-valid" : "text-invalid"
            )}
            style={{ fontSize: 20 }}
          >
            {actualClassification === "VALID" ? "Valid setup." : "Not valid."}
          </p>
          <p className="text-[13px] text-secondary">
            {isCorrect
              ? "Your read was correct."
              : `You called this ${userAnswer.toLowerCase()}.`}
          </p>
        </div>
        <span
          className={cn(
            "text-[11px] font-mono shrink-0 mt-0.5",
            isCorrect ? "text-valid" : "text-invalid/80"
          )}
        >
          {isCorrect ? "✓ right" : "✗ wrong"}
        </span>
      </div>

      {/* Example notes — primary learning content */}
      {exampleNotes && (
        <div className="border-l-2 border-accent/40 bg-accent/5 rounded-r px-4 py-3">
          <p className="text-[13px] text-primary leading-relaxed">{exampleNotes}</p>
        </div>
      )}

      {/* Checklist rules — reference only on incorrect answers */}
      {!isCorrect && checklistRules.length > 0 && (
        <div className="flex flex-col gap-1.5 pl-1">
          {checklistRules.map((rule) => (
            <p key={rule.id} className="text-[11px] text-muted font-mono leading-relaxed">
              — {rule.text}
            </p>
          ))}
        </div>
      )}

      {error && (
        <p className="text-[11px] text-invalid font-mono">{error}</p>
      )}

      {/* Continue — right-aligned, not full-width */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={onNext}
          disabled={isPending}
          className={cn(
            "px-6 py-2.5 rounded border border-border-strong text-[13px] font-semibold text-primary",
            "bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] hover:border-accent/30 transition-all",
            "disabled:opacity-40"
          )}
        >
          {isPending ? "Loading…" : isLast ? "See results →" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
